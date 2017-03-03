import packageJSON from '../../package.json';
import Pubsub from './pubsub';
import Remote from './remote';
import DataStore from './datastore';

var eventId = 0;
export default class {
	constructor(options) {
		this.options = options;
		this.appId = options.appId;
		this.store = options.store;
		if(!this.appId) throw new Error('appId required');
		if(!this.store) throw new Error('store required');
		this.uuid = options.uuid;
		this.apiKey = options.apiKey;
		this.accessToken = options.accessToken;
		this.useSSL = options.hasOwnProperty('useSSL') ? options.useSSL : true;
		this.host = options.host || 'pubsub1.mlkcca.com';
		this.port = options.port || 443;
		this.keepaliveTimeout = options.keepaliveTimeout || 300;
		let headers = {};
		if(this.accessToken) headers['Authorization'] = "Bearer " + this.accessToken;
		this.remote = new Remote(this.host, this.port, this.useSSL, headers);
		this.wsOptions = {
			headers: headers
		}
	}

	version() {
		return packageJSON.version;
	}

	getAppId() {
		return this.appId;
	}

	connect() {
		this.websocket = new Pubsub({
			host: this._get_pubsub_url(this.useSSL, this.host, this.port, this.appId, this.apiKey, this.uuid),
			logger: console,
			wsOptions: this.wsOptions
		});
		this.websocket.connect();
	}

	_get_pubsub_url(ssl, host, port, appId, apikey, uuid) {
		if(apikey) return `ws${ssl?'s':''}://${host}:${port}/ws2/${appId}/${apikey}?uuid=${uuid}`;
		else return `ws${ssl?'s':''}://${host}:${port}/ws2/${appId}?uuid=${uuid}`;
	}

	_get_api_url(api) {
		let appOptions = this._get_options();
		if(appOptions.apiKey) return `/api/${api}/${appOptions.appId}/${appOptions.apiKey}`;
		else return `/api/${api}/${appOptions.appId}`;
	}

	_get_pubsub() {
		return this.websocket;
	}

	_get_remote() {
		return this.remote;
	}

	_get_options() {
		return this.options;
	}

	dataStore(path, options) {
		return new DataStore(this, path, options);
	}

	grant(options, cb) {
		let apiUrl = this._get_api_url('grant');
		let params = {};
		this.remote.get(apiUrl, params).then(function(accessToken) {
			cb(null, accessToken);
		}).catch(function(err) {
			cb(err);
		});

	}

	static history(options, cb) {
		let appId = options.appId;
		let apiKey = options.apiKey;
		let useSSL = options.hasOwnProperty('useSSL') ? options.useSSL : true;
		let host = options.host || 'pubsub1.mlkcca.com';
		let port = options.port || 443;
		var remote = new Remote(host, port, useSSL, {});
		remote.get(`/api/history/${appId}/${apiKey}`, {c:options.path}).then(function(messages) {
			cb(null, messages);
		}).catch(function(err) {
			cb(err);
		});
	}

	static grant() {

	}
}