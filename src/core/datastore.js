import PushDataType from './datatypes/push';
import SendDataType from './datatypes/send';
import Cache from '../cache';

export default class {
	constructor(root, path, _options) {
		this.root = root;
		this.path = path;
		let options = _options || {};
		this.setDataType(options.datatype || 'json');
		this.cache = new Cache();
	}

	setDataType(datatype) {
		if(datatype != 'text' && datatype != 'json' && datatype == 'binary') {
			throw new Error('invalid datatype');
		}
		this.datatype = datatype;
	}

	on(event, cb, onComplete) {
		if(event == 'push') {
			this.root._get_pubsub().subscribe(this.path, 'push', (message) => {
				cb(PushDataType.decode(message, this.datatype));
			}, onComplete);
		}else if(event == 'set') {
			this.root._get_pubsub().subscribe(this.path, 'set', (message) => {
				cb(PushDataType.decode(message, this.datatype));
			}, onComplete);
		}else if(event == 'send') {
			this.root._get_pubsub().subscribe(this.path, 'send', (message) => {
				cb(SendDataType.decode(message, this.datatype));
			}, onComplete);
		}
	}

	off(event, cb) {
		let op = '_p';
		if(event == 'push') op = '_p';
		else if(event == 'send') op = '_s';
		this.root._get_pubsub().unsubscribe(this.path, op, cb);
	}

	push(value, options, cb) {
		if(typeof options === 'function') {
			cb = options;
		}
		this.root._get_pubsub().publish(this.path, 'push', value, cb);
	}

	set(id, value, options, cb) {
		if(typeof options === 'function') {
			cb = options;
		}
		this.root._get_pubsub().publish(this.path, 'set', value, cb, {_id: id});
	}

	send(value, cb) {
		this.root._get_pubsub().publish(this.path, 'send', value, cb);
	}

	history(options, cb) {
		let apiUrl = this.root._get_api_url('history');
		let params = {
			c:this.path
		}
		params.limit = options.limit || 100;
		params.order = options.order || 'desc'
		if(options.ts) {
			params.id = 'd';
			params.ts = options.ts;
		}

		if(options.useCache && options.ts && params.order == 'desc') {
			let decoded_messages = this.cache.query(options.ts, params.limit)
			if(decoded_messages) {
				cb(null, decoded_messages);
				return;
			}
		}

		this.root._get_remote().get(apiUrl, params).then((result) => {
			if(result.err) {
				cb(result.err);
			}else{
				let messages = result.content;
				let decoded_messages = messages.map((m)=>PushDataType.decode(m, this.datatype));
				if(options.useCache && options.ts && params.order == 'desc' && messages.length > 0) {
			    	this.cache.add(options.ts, decoded_messages);
				}
				cb(null, decoded_messages);
			}
		}).catch(function(err) {
			cb(err);
		});
	}

}
