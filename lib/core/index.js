'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _pubsub = require('./pubsub');

var _pubsub2 = _interopRequireDefault(_pubsub);

var _remote = require('./remote');

var _remote2 = _interopRequireDefault(_remote);

var _datastore = require('./datastore');

var _datastore2 = _interopRequireDefault(_datastore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var eventId = 0;

var _class = function () {
	function _class(options) {
		_classCallCheck(this, _class);

		this.options = options;
		this.appId = options.appId;
		this.store = options.store;
		if (!this.appId) throw new Error('appId required');
		if (!this.store) throw new Error('store required');
		this.uuid = this.get_uuid(options.uuid);
		this.apiKey = options.apiKey;
		this.accessToken = options.accessToken;
		this.useSSL = options.hasOwnProperty('useSSL') ? options.useSSL : true;
		this.host = options.host || 'pubsub1.mlkcca.com';
		this.port = options.port || 443;
		this.keepaliveTimeout = options.keepaliveTimeout || 300;
		var headers = {};
		if (this.accessToken) headers['Authorization'] = "Bearer " + this.accessToken;
		this.remote = new _remote2.default(this.host, this.port, this.useSSL, headers);
		this.wsOptions = {
			headers: headers
		};
		this.connect();
	}

	_createClass(_class, [{
		key: 'version',
		value: function version() {
			return _package2.default.version;
		}
	}, {
		key: 'getAppId',
		value: function getAppId() {
			return this.appId;
		}
	}, {
		key: 'get_uuid',
		value: function get_uuid(uuid) {
			if (uuid) {
				this.store.set('uuid', uuid);
			} else {
				var current_uuid = this.store.get('uuid', uuid);
				if (current_uuid) {
					uuid = current_uuid;
				} else {
					uuid = (0, _uuid2.default)();
					this.store.set('uuid', uuid);
				}
			}
			return uuid;
		}
	}, {
		key: 'connect',
		value: function connect() {
			this.websocket = new _pubsub2.default({
				host: this._get_pubsub_url(this.useSSL, this.host, this.port, this.appId, this.apiKey, this.accessToken, this.uuid),
				logger: console,
				WebSocket: this.options.WebSocket,
				wsOptions: this.wsOptions
			});
			this.websocket.connect();
		}
	}, {
		key: 'disconnect',
		value: function disconnect() {
			this.websocket.disconnect();
		}
	}, {
		key: '_get_pubsub_url',
		value: function _get_pubsub_url(ssl, host, port, appId, apikey, accessToken, uuid) {

			var base = 'ws' + (ssl ? 's' : '') + '://' + host + ':' + port + '/ws2/' + appId + '/';
			if (apikey) return base + apikey + '?' + _querystring2.default.stringify({ uuid: uuid });else if (accessToken) return base + '?' + _querystring2.default.stringify({ at: accessToken, uuid: uuid });else return base + '?' + _querystring2.default.stringify({ uuid: uuid });
		}
	}, {
		key: '_get_api_url',
		value: function _get_api_url(api) {
			var appOptions = this._get_options();
			if (appOptions.apiKey) return '/api/' + api + '/' + appOptions.appId + '/' + appOptions.apiKey;else return '/api/' + api + '/' + appOptions.appId;
		}
	}, {
		key: '_get_pubsub',
		value: function _get_pubsub() {
			return this.websocket;
		}
	}, {
		key: '_get_remote',
		value: function _get_remote() {
			return this.remote;
		}
	}, {
		key: '_get_options',
		value: function _get_options() {
			return this.options;
		}
	}, {
		key: 'dataStore',
		value: function dataStore(path, options) {
			return new _datastore2.default(this, path, options);
		}
	}, {
		key: 'grant',
		value: function grant(options, cb) {
			var apiUrl = this._get_api_url('grant');
			var params = {};
			this.remote.get(apiUrl, params).then(function (accessToken) {
				cb(null, accessToken);
			}).catch(function (err) {
				cb(err);
			});
		}
	}], [{
		key: 'history',
		value: function history(options, cb) {
			var appId = options.appId;
			var apiKey = options.apiKey;
			var useSSL = options.hasOwnProperty('useSSL') ? options.useSSL : true;
			var host = options.host || 'pubsub1.mlkcca.com';
			var port = options.port || 443;
			var remote = new _remote2.default(host, port, useSSL, {});
			remote.get('/api/history/' + appId + '/' + apiKey, { c: options.path }).then(function (messages) {
				cb(null, messages);
			}).catch(function (err) {
				cb(err);
			});
		}
	}, {
		key: 'grant',
		value: function grant() {}
	}]);

	return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
