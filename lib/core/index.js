'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

		this.appId = options.appId;
		this.store = options.store;
		if (!this.appId) throw new Error('appId required');
		if (!this.store) throw new Error('store required');
		this.uuid = options.uuid;
		this.apiKey = options.apiKey;
		this.accessToken = options.accessToken;
		this.useSSL = options.hasOwnProperty('useSSL') ? options.useSSL : true;
		this.host = options.host || 'pubsub1.mlkcca.com';
		this.port = options.port || 443;
		this.keepaliveTimeout = options.keepaliveTimeout || 300;
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
		key: 'connect',
		value: function connect() {
			this.websocket = new _pubsub2.default({
				host: this._get_pubsub_url(this.useSSL, this.host, this.port, this.appId, this.apiKey, this.uuid),
				logger: console
			});
			this.websocket.connect();
		}
	}, {
		key: '_get_pubsub_url',
		value: function _get_pubsub_url(ssl, host, port, appId, apikey, uuid) {
			return 'ws' + (ssl ? 's' : '') + '://' + host + ':' + port + '/ws2/' + appId + '/' + apikey + '?uuid=' + uuid;
		}
	}, {
		key: 'dataStore',
		value: function dataStore(path) {
			return new _datastore2.default(this.websocket, path);
		}
	}, {
		key: 'grant',
		value: function grant() {}
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


function getEventId() {
	return eventId++;
}

function get_wsURL(host, appId, topic, apikey) {
	return 'http://' + host + '/ws2/' + appId + '/' + apikey + '?uuid=ws1';
}

module.exports = exports['default'];
//# sourceMappingURL=index.js.map
