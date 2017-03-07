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
		this.removeListener(topic, cb);
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

export default class {
	constructor(options) {
		this.target = options.WebSocket;
		this.host = options.host;
		//this.client = new WebSocketClient();
		this.connected = false;
		this.logger = options.logger;
		this.requestId = 0;
		this.requestMap = {};
		this.subscriberMan = new SubscriberManager();
		this.offlineQueue = [];
		this.wsOptions = options.wsOptions;
		this.reconnectPeriod = options.reconnectPeriod || 5000;
	}

	connect() {
		if(!this.connected) {
			this.client = new WebSocket(this.target, this.host, this.wsOptions);
			this.client.on('error', (error) => {
				this.logger.error(error);
				this.clean();
				this._setupReconnect();
			});

			this.client.on('close', (e) => {
				this.logger.log('closed', e);
				this.clean();
				if(e.code > 1000) this._setupReconnect();
			});

			this.client.on('open', () => {
				this.logger.log('connected');
				this.connected = true;
				this.subscriberMan.get().map((s) => {
					this._subscribe(s.path, s.op, s.cb);
				});
				this.flushOfflineMessage();
			});

			this.client.on('message', (utf8message) => {
				let message = JSON.parse(utf8message);
				if(message.hasOwnProperty('e')) {
					this.response(message);
				}else{
					this.deliver(message);	
				}
			});
			//this.client.connect(this.host);
		}else{
			this.logger.warn('already connected');
		}
	}

	disconnect() {
		if(this.connected) {
			this.client.close();
		}else{
			this.logger.warn('already disconnected');
		}
	}

	_setupReconnect() {
		setTimeout(() => {
			this.connect();
		}, this.reconnectPeriod);
	}

	response(message) {
		let cb = this.requestMap[message.e];
		if(cb) cb(message);
		this.unregisterCallback(message.e);
	}

	deliver(message) {
		this.subscriberMan.deliver(message.p, message);
	}

	publish(path, op, v, cb) {
		if(typeof v !== 'string') v = JSON.stringify(v);
		this.send({
        	e: this.registerCallback(cb),
        	p: path,
        	_t: 'p',
        	_o: op,
        	v: v
		});
	}

	subscribe(path, op, cb, onComplete) {
		this.subscriberMan.reg(path, op, cb);
		this._subscribe(path, op, cb, onComplete);
	}

	_subscribe(path, op, cb, onComplete) {
		this.send({
        	e: this.registerCallback(onComplete),
        	p: path,
        	_t: 's',
        	_o: op
		});
	}


	unsubscribe(path, op, cb) {
		this.subscriberMan.unreg(path, op, cb);
		this.send({
        	e: this.registerCallback(cb),
        	p: path,
        	_t: 'u',
        	_o: op
		});
	}

	send(message) {
		if(this.connected) {
			this.client.send(JSON.stringify(message));
		}else{
			this.offlineQueue.push(message);
			this.logger.log('offline send');
		}
	}

	flushOfflineMessage() {
		if(this.connected) {
			this.offlineQueue.forEach((m) => {
				this.send(m);
			});
			this.offlineQueue = [];
		}else{
			this.logger.warn('connection closed');
		}
	}

	close() {
		if(this.connected) {
			this.client.close();
		}else{
			this.logger.warn('already closed');
		}
	}

	clean() {
		this.client.close();
		this.connected = false;
		this.client.clean();
		this.client = null;
	}

	registerCallback(cb) {
		let rid = this.getRequestId();
		this.requestMap[rid] = cb;
		return rid;
	}

	unregisterCallback(rid) {
		delete this.requestMap[rid];
	}

	getRequestId() {
		if(this.requestId > 100000) this.requestId = 0;
		return this.requestId++;
	}

}
