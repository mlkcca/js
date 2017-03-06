let WebSocket = null;
let isBrowser = false;

if ('browser' !== process.title) {
	WebSocket = require('ws');
}else{
	isBrowser = true;
	WebSocket = window.WebSocket;
}

let EventEmitter = require("events").EventEmitter;

export default class extends EventEmitter {
	constructor(host, options) {
		super();
		if(isBrowser) {
			this.client = new WebSocket(host);
			this.client.onerror = this.fire('error');
			this.client.onclose = this.fire('close');
			this.client.onopen = this.fire('open');
			this.client.onmessage = (msg) => {
				this.emit('message', msg.data);
			}
		}else{
			this.client = new WebSocket(host, options);
			this.client.on('error', this.fire('error'));
			this.client.on('close', this.fire('close'));
			this.client.on('open', this.fire('open'));
			this.client.on('message', this.fire('message'));
		}
	}

	send(msg) {
		this.client.send(msg);
	}

	fire(e) {
		return (params) => {
			this.emit(e, params)
		}
	}
}

