import PushDataType from './datatypes/push';
import SendDataType from './datatypes/send';

export default class {
	constructor(root, path, _options) {
		this.root = root;
		this.path = path;
		let options = _options || {};
		this.setDataType(options.datatype || 'json');
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
		if(options.limit) params.limit = options.limit;
		if(options.order) params.order = options.order;
		if(options.ts) params.ts = options.ts;


		this.root._get_remote().get(apiUrl, params).then(function(messages) {
			cb(null, messages);
		}).catch(function(err) {
			cb(err);
		});
	}

}
