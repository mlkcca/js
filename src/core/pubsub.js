import MessageStore from './MessageStore'
import reInterval from 'reinterval'
let EventEmitter = require("events").EventEmitter;

class SubscriberManager extends EventEmitter {
	constructor(root, op) {
		super();
		this.root = root;
		this.op = op;
		this.subscribers = {};
		this.timestamp = 0;
		this.caller = null;
	}

	reg(path, cb, onComplete) {
		this.subscribers[path] = {cb:cb};
		this.on(path, cb);
		this._startSubscribe(onComplete);
	}

	_get_path_list() {
		return Object.keys(this.subscribers);
	}

	_startSubscribe(onComplete) {
		this._stopSubscribe()
		let apiUrl = this.root._get_on_url(this.op || 'push');
		let pathList = this._get_path_list();
		if(pathList.length == 0) return;
		let path = pathList.join(',');
		this.caller = this.root._get_remote().get2(apiUrl, Object.assign({c:path,t:this.timestamp}, {}), (err, res) => {
			console.log(err);
			if(err) {
				if(onComplete) onComplete(err);
				setTimeout(() => {
					this._startSubscribe();
				}, 5000);
				return;
			}
			if(res.err) {
				if(res.err == 'permission_denied') {
					if(onComplete) onComplete(res.err);
				}else{
					if(onComplete) onComplete(res.err);
				}
			}else{
				Object.keys(res).forEach((key) => {
					if(this.timestamp < res[key][0][0])
						this.timestamp = res[key][0][0];
					res[key].reverse().map((m) => {
						return {
							id: m[1],
							t: m[0],
							v: m[2]
						}
					}).forEach((m) => {
						this.emit(key, m);
					});
				})
				this._startSubscribe()
			}

		});
	}

	_stopSubscribe() {
		if(this.caller) this.caller.abort();
	}

	unreg(path, cb) {
		delete this.subscribers[path];
		if(cb) {
			this.removeListener(path, cb);
		}else{
			this.removeAllListeners(path);
		}
	}

	deliver(topic, message) {
		this.emit(topic, message);
	}

	get() {
		return Object.keys(this.subscribers).map((topic) => {
			return this.subscribers[topic];
		});
	}
}



/*
 * state offline -> connecting -> online -> disconnecting -> offline
 *  offline -> connecting
 *  connecting -> online
 *             -> offline
 *  online     -> disconnecting
 *  online     -> offline
 *  disconnecting -> offline
 */

export default class extends EventEmitter {
	constructor(options, root) {
		super();
		this.options = options;
		this.root = root;
		this.host = options.host;
		this.logger = options.logger;
		this.subscriberMan = {};
		this.subscriberMan.push = new SubscriberManager(root, 'push');
		this.subscriberMan.set = new SubscriberManager(root, 'set');
		this.subscriberMan.send = new SubscriberManager(root, 'send');
		this.offlineQueue = [];
		this.messageStore = new MessageStore();
		this.wsOptions = options.wsOptions;
		this.reconnectPeriod = options.reconnectPeriod || 5000;
		this.reconnectTimer = null;
		this.pingTimer = null;
		this.pongArrived = true;
		this.state = 'offline';
	}

	sendEvent(event, params) {
		let result = null;
		switch(this.getState()) {
			case 'offline':
				result = this.offline(event, params);
				break;
			case 'connecting':
				result = this.connecting(event, params);
				break;
			case 'online':
				result = this.online(event, params);
				break;
			case 'disconnecting':
				result = this.disconnecting(event, params);
				break;
			default:
				console.error('unknow state');
		}
		if(result) {
			this.emit('state-changed', {
				currentState: this.state,
				nextState: result.nextState
			});
			this.logger.log('state changed from ' + this.state + ' to ' + result.nextState);
			this.state = result.nextState;
		}
	}

	getState() {
		return this.state;
	}

	offline(event) {
		if(event == 'connect') {
			//this._connect();
			return {
				nextState: 'connecting'
			}
		}else{
			return null;
		}
	}

	connecting(event, params) {
		if(event == 'connect') {
			this.logger.warn('already connecting');
			return null;
		}else if(event == 'opened') {
			//open
			this.emit('open', {});
			/*
			this.subscriberMan.get().map((s) => {
				this._subscribe(s.path, s.op, s.cb);
			});
			*/
			this.flushOfflineMessage();
			this._setupPingTimer();
			return {
				nextState: 'online'
			}
		}else if(event == 'error') {
			this._clean();
			this._setupReconnect();
			return null;
		}else if(event == 'closed') {
			this._clean();
			if(params.code > 1000) {
				this._setupReconnect();
				return null;
			}else{
				return {
					nextState: 'offline'
				}
			}
		}else{
			return null;
		}
	}

	online(event, params) {
		if(event == 'connect') {
			this.logger.warn('already connected');
			return null;
		}else if(event == 'opened') {
			this.logger.warn('already connected');
			return null;
		}else if(event == 'error') {
			this._clean();
			this._setupReconnect();
			return {
				nextState: 'connecting'
			}
		}else if(event == 'closed') {
			this._clean();
			if(params.code > 1000) {
				this._setupReconnect();
				return {
					nextState: 'connecting'
				}
			}else{
				return {
					nextState: 'offline'
				}
			}
		}else if(event == 'disconnect') {
			this._disconnect();
			return {
				nextState: 'disconnecting'
			}
		}else{
			return null;
		}
	}

	disconnecting(event) {
		if(event == 'error' || event == 'closed') {
			this._clean();
			return {
				nextState: 'offline'
			}
		}else{
			this.logger.warn('now disconnecting');
			return null;
		}
	}

	/* API */
	connect() {
		this.sendEvent('connect', {});
	}

	disconnect() {
		this.sendEvent('disconnect', {});
	}

	publish(path, op, v, cb, _options) {
		let options = _options || {};

		v = JSON.stringify(v);
		let rid = this.messageStore.add({path:path,op:op,v:v,options:_options}, cb);
		let apiUrl = this.root._get_api_url(op || 'push');
		let retryTimer = setTimeout(() => {
			this.flushOfflineMessage(() => {
			});
		}, 10000);
		this.root._get_remote().get(apiUrl, Object.assign({c:path,v:v}, _options)).then((res) => {
			this.messageStore.recvAck(rid, res);
			clearTimeout(retryTimer);
			//cb(null, res);
		}).catch(function(err) {
			cb(err);
		});
	}

	/* connect時に呼ばれる */
	flushOfflineMessage(cb) {
		let message = this.messageStore.enq();
		if(message) {
			let mes = message.message;
			let rid = message.id;
			let apiUrl = this.root._get_api_url(mes.op || 'push');
			this.root._get_remote().get(apiUrl, Object.assign({c:mes.path,v:mes.v}, mes.options)).then((res) => {
				this.messageStore.recvAck(rid, res);
				this.flushOfflineMessage(cb);
			}).catch(function(err) {
				cb(err);
			});
		}else{
			cb(null);
		}
	}

	subscribe(path, op, cb, onComplete) {
		this.subscriberMan[op].reg(path, cb, onComplete);
		//this._subscribe(path, op, cb, onComplete);
	}

	unsubscribe(path, op, cb) {
		this.subscriberMan[op].unreg(path, cb);
	}

	/* private API */


	_setupReconnect() {
		setTimeout(() => {
			this._connect();
		}, this.reconnectPeriod);
	}

	response(message) {
		this.messageStore.recvAck(message.e, message);
	}

	deliver(message) {
		this._resetPingInterval();
		this.subscriberMan.deliver(message.p, message);
	}

	_subscribe(path, op, cb, onComplete) {
		this.send({
        	p: path,
        	_t: 's',
        	_o: op
		}, onComplete);
	}

	send(message, cb) {
		this.messageStore.add(message, cb);
		if(this.client && this.getState() == 'online') {
			this.client.send(JSON.stringify(message));
			this._resetPingInterval();
		}
	}


	_clean() {
		this.client.close();
		this.client.clean();
		this.client = null;
		if (this.pingTimer !== null) {
			this.pingTimer.clear()
			this.pingTimer = null
		}
		this.emit('close', {});
	}

	_setupPingTimer() {
		if (!this.pingTimer && this.options.keepalive) {
			this.pongArrived = true
			this.pingTimer = reInterval(() => {
				this._checkPing()
			}, this.options.keepalive * 1000)
		}
	}

	_resetPingInterval() {
		if (this.pingTimer && this.options.keepalive) {
			this.pingTimer.reschedule(this.options.keepalive * 1000)
		}
	}

	_checkPing() {
		if (this.pongArrived) {
			this.pongArrived = false
			this.client.ping()
		} else {
			this.sendEvent('error', {message: 'pong not coming'});
		}
	}

	_handlePong() {
		this.pongArrived = true
	}

}
