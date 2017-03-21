import MessageStore from './MessageStore'
import reInterval from 'reinterval'
let WebSocket = require('./ws');
let EventEmitter = require("events").EventEmitter;

class SubscriberManager extends EventEmitter {
	constructor() {
		super();
		this.subscribers = {};
	}

	reg(path, op, cb) {
		let topic = path+'/'+op;
		this.subscribers[topic] = {path:path, op:op, cb:cb};
		this.on(topic, cb);
	}

	unreg(path, op, cb) {
		let topic = path+'/'+op;
		delete this.subscribers[topic];
		if(cb) {
			this.removeListener(topic, cb);
		}else{
			this.removeAllListeners(topic);
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
	constructor(options) {
		super();
		this.options = options;
		this.target = options.WebSocket;
		this.host = options.host;
		//this.client = new WebSocketClient();
		this.logger = options.logger;
		this.subscriberMan = new SubscriberManager();
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
			this._connect();
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
			this.subscriberMan.get().map((s) => {
				this._subscribe(s.path, s.op, s.cb);
			});
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

	publish(path, op, v, cb) {
		if(typeof v !== 'string') v = JSON.stringify(v);
		this.send({
        	p: path,
        	_t: 'p',
        	_o: op,
        	v: v
		}, cb);
	}

	subscribe(path, op, cb, onComplete) {
		this.subscriberMan.reg(path, op, cb);
		this._subscribe(path, op, cb, onComplete);
	}

	unsubscribe(path, op, cb) {
		this.subscriberMan.unreg(path, op, cb);
		this.send({
        	p: path,
        	_t: 'u',
        	_o: op
		}, cb);
	}

	/* private API */

	_connect() {
		this.client = new WebSocket(this.target, this.host, this.wsOptions);
		this.client.on('error', (error) => {
			this.logger.error(error);
			this.sendEvent('error', {});
		});

		this.client.on('close', (code) => {
			this.logger.log('closed', code);
			this.sendEvent('closed', {code: code});
		});

		this.client.on('open', () => {
			this.sendEvent('opened', {});
		});

		this.client.on('message', (utf8message) => {
			let message = JSON.parse(utf8message);
			if(message.hasOwnProperty('e')) {
				this.response(message);
			}else{
				this.deliver(message);	
			}
		});

		this.client.on('pong', () => {
			this._handlePong();
		})
	}

	_disconnect() {
		this.client.close();
	}

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

	/* connect時に呼ばれる */
	flushOfflineMessage() {
		let message = this.messageStore.enq();
		if(message) {
			this.client.send(JSON.stringify(message));
			this.flushOfflineMessage();
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
