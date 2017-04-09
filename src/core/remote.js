var ajax = require('./ajax');

export default class {
    constructor(host, port, secure, headers){
    	this.host = host;
    	this.port = port,
    	this.secure = secure;
    	this.headers = headers;
    }

	post(path, params, _qs, _headers) {
		let qs = _qs || null;
		let headers = Object.assign({}, this.headers, _headers);
		return new Promise((resolve, reject) => {
			ajax.request('POST', this.secure, this.host, this.port, path, qs, JSON.stringify(params), headers, function(err, data) {
				if(err) {
					return reject(err);
				}
				if(data.err) {
					return reject(data.err);
				}
				resolve(data.content);
			});
		});
	}

	get(path, params) {
		/*
		var qs = {};
		Object.keys(params).forEach(function(k) {
			qs[k] = JSON.stringify(params[k]);
		})
		*/
		return new Promise((resolve, reject) => {
			ajax.request('GET', this.secure, this.host, this.port, path, params, null, this.headers, function(err, data) {
				if(err) {
					return reject(err);
				}
				/*
				if(data.err) {
					return reject(data.err);
				}
				*/
				resolve(data);
			});
		});
	}

	get2(path, params, cb) {
		return ajax.request('GET', this.secure, this.host, this.port, path, params, null, this.headers, function(err, data) {
			if(err) {
				return cb(err);
			}
			cb(null, data);
		});
	}
	
	put(path, params) {
		return new Promise((resolve, reject) => {
			ajax.request('PUT', this.secure, this.host, this.port, path, null, JSON.stringify(params), this.headers, function(err, data) {
				if(err) {
					return reject(err);
				}
				if(data.err) {
					return reject(data.err);
				}
				resolve(data.content);
			});
		});
	}

	delete(path, params) {
		var qs = {};
		Object.keys(params).forEach(function(k) {
			qs[k] = JSON.stringify(params[k]);
		})
		return new Promise((resolve, reject) => {
			ajax.request('DELETE', this.secure, this.host, this.port, path, qs, null, this.headers, function(err, data) {
				if(err) {
					return reject(err);
				}
				if(data.err) {
					return reject(data.err);
				}
				resolve(data.content);
			});
		});
	}

}