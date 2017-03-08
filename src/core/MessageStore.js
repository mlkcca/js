export default class {

	constructor() {
		this.requestId = 0;
		this.messages = []
	}

	add(message, onAck) {
		let rid = this.getRequestId();
		message.e = rid;
		this.messages.push({
			id: rid,
			message: message,
			cb: onAck
		})
	}

	recvAck(rid, args) {
		let m = this.messages.filter((m)=>m.id === rid)[0];
		if(m && m.cb) m.cb(args); 
		this.messages = this.messages.filter((m)=>m.id !== rid);
	}

	enq() {
		let message = this.messages.shift();
		if(message)
			return message.message;
		else
			return null;
	}

	getRequestId() {
		if(this.requestId > 100000) this.requestId = 0;
		return this.requestId++;
	}
}