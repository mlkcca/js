let isBrowser = ('browser' === process.title);

let EventEmitter = require("events").EventEmitter;

export default class extends EventEmitter {
	constructor(Module, host, options) {
		super();
		if(isBrowser) {
			this.client = new Module(host);
			this.client.onerror = this.fire('error');
			this.client.onclose = (e)=>{this.emit('close', e.code)}
			this.client.onopen = this.fire('open');
			this.client.onmessage = (msg) => {
				if(msg.data == 'pong') this.emit('pong', msg.data);
				else this.emit('message', msg.data);
			}
		}else{
			this.client = new Module(host, options);
			this.client.on('error', this.fire('error'));
			this.client.on('close', this.fire('close'));
			this.client.on('open', this.fire('open'));
			this.client.on('message', (data) => {
				if(data == 'pong') this.emit('pong', data);
				else this.emit('message', data);
			});
		}
	}

	getReadyState() {
		return this.client.readyState;
	}

	send(msg) {
		this.client.send(msg);
	}

	ping(msg) {
		this.client.send("ping");
	}

	fire(e) {
		return (params) => {
			this.emit(e, params)
		}
	}

	close(code, reason) {
		this.client.close(code, reason);
	}

	clean() {
		this.removeAllListeners('error');
		this.removeAllListeners('close');
		this.removeAllListeners('open');
		this.removeAllListeners('message');
	}
}

