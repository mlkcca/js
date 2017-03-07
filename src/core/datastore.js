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
			this.root._get_pubsub().subscribe(this.path, '_p', (message) => {
				cb(PushDataType.decode(message, this.datatype));
			}, onComplete);
		}else if(event == 'send') {
			this.root._get_pubsub().subscribe(this.path, '_s', (message) => {
				cb(SendDataType.decode(message, this.datatype));
			}, onComplete);
		}
	}

	push(value, options, cb) {
		if(typeof options === 'function') {
			cb = options;
		}
		this.root._get_pubsub().publish(this.path, '_p', value, cb);
	}

	send(value, cb) {
		this.root._get_pubsub().publish(this.path, '_s', value, cb);
	}

	history(options, cb) {
		let apiUrl = this.root._get_api_url('history');
		let params = {
			c:this.path
		}
		params.limit = options.limit || 100;
		params.order = options.order || 'desc'
		if(options.ts) {
			params.ts = options.ts;
		}

		let messages = null;

		if(options.useCache && options.ts && params.order == 'desc') {
			messages = this.cache.query(options.ts, params.limit)
		}

		if(messages !== null) {
			cb(null, messages);
		}else{
			this.root._get_remote().get(apiUrl, params).then((messages) => {
				if(options.useCache && options.ts && params.order == 'desc') {
			    	this.cache.add(options.ts, messages);
				}
				cb(null, messages);
			}).catch(function(err) {
				cb(err);
			});
		}
	}

}
