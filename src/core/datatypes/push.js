export default class {
	constructor() {
	}

	static decode(message, type) {
		if(type == 'json') return this.json(message);
		else if(type == 'text') return this.text(message);
		else if(type == 'binary') return this.binary(message);
		else return this.text(message);
	}

	static json(message) {
		return {
			id: message.id,
			timestamp: message.t,
			value: JSON.parse(message.v)
		}
	}

	static text(message) {
		return message;
	}

	static binary(message) {
		//TODO
		return message;
	}

}
