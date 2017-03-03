export default class {
	constructor(socket, path) {
		this.socket = socket;
		this.path = path;
	}

	on(event, cb, onComplete) {
		if(event == 'push') {
			this.socket.subscribe(this.path, '_p', cb, onComplete);
		}
	}

	push(value, options, cb) {
		if(typeof options === 'function') {
			cb = options;
		}
		this.socket.publish(this.path, '_p', value, cb);
	}
}
