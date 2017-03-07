let WebSocket = require('./ws');


export default class {
	constructor(options) {
		this.target = options.WebSocket;
		this.host = options.host;
		//this.client = new WebSocketClient();
		this.connected = false;
		this.connection = null;
		this.logger = options.logger;
		this.messageHandler = function() {

		}
		this.requestId = 0;
		this.requestMap = {};
		this.subscribers = {};
		this.offlineQueue = [];
		this.wsOptions = options.wsOptions;
		this.init();
	}

	init(messageHandler, closeHandler, errorHandler) {

	}

	connect() {
		if(!this.connected) {
			this.client = new WebSocket(this.target, this.host, this.wsOptions);
			this.client.on('error', (error) => {
				this.logger.error(error);
				this.clean();
			});

			this.client.on('close', () => {
				this.logger.log('closed');
				this.clean();
			});

			this.client.on('open', () => {
				this.logger.log('connected');
				this.connected = true;
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

	response(message) {
		let cb = this.requestMap[message.e];
		if(cb) cb(message);
		this.unregisterCallback(message.e);
	}

	deliver(message) {
		this.subscribers[message.p](message);
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
		this.subscribers[path+'/' + op] = cb;
		this.send({
        	e: this.registerCallback(onComplete),
        	p: path,
        	_t: 's',
        	_o: op
		});
	}

	unsubscribe(path, op, cb) {
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
		this.connected = false;
		this.connection = null;
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
