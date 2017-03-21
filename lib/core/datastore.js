'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _push = require('./datatypes/push');

var _push2 = _interopRequireDefault(_push);

var _send = require('./datatypes/send');

var _send2 = _interopRequireDefault(_send);

var _cache = require('../cache');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
	function _class(root, path, _options) {
		_classCallCheck(this, _class);

		this.root = root;
		this.path = path;
		var options = _options || {};
		this.setDataType(options.datatype || 'json');
		this.cache = new _cache2.default();
	}

	_createClass(_class, [{
		key: 'setDataType',
		value: function setDataType(datatype) {
			if (datatype != 'text' && datatype != 'json' && datatype == 'binary') {
				throw new Error('invalid datatype');
			}
			this.datatype = datatype;
		}
	}, {
		key: 'on',
		value: function on(event, cb, onComplete) {
			var _this = this;

			if (event == 'push') {
				this.root._get_pubsub().subscribe(this.path, '_p', function (message) {
					cb(_push2.default.decode(message, _this.datatype));
				}, onComplete);
			} else if (event == 'send') {
				this.root._get_pubsub().subscribe(this.path, '_s', function (message) {
					cb(_send2.default.decode(message, _this.datatype));
				}, onComplete);
			}
		}
	}, {
		key: 'off',
		value: function off(event, cb) {
			var op = '_p';
			if (event == 'push') op = '_p';else if (event == 'send') op = '_s';
			this.root._get_pubsub().unsubscribe(this.path, op, cb);
		}
	}, {
		key: 'push',
		value: function push(value, options, cb) {
			if (typeof options === 'function') {
				cb = options;
			}
			this.root._get_pubsub().publish(this.path, '_p', value, cb);
		}
	}, {
		key: 'send',
		value: function send(value, cb) {
			this.root._get_pubsub().publish(this.path, '_s', value, cb);
		}
	}, {
		key: 'history',
		value: function history(options, cb) {
			var _this2 = this;

			var apiUrl = this.root._get_api_url('history');
			var params = {
				c: this.path
			};
			params.limit = options.limit || 100;
			params.order = options.order || 'desc';
			if (options.ts) {
				params.id = 'd';
				params.ts = options.ts;
			}

			if (options.useCache && options.ts && params.order == 'desc') {
				var decoded_messages = this.cache.query(options.ts, params.limit);
				cb(null, decoded_messages);
				return;
			}

			this.root._get_remote().get(apiUrl, params).then(function (messages) {
				var decoded_messages = messages.map(function (m) {
					return _push2.default.decode(m, _this2.datatype);
				});
				if (options.useCache && options.ts && params.order == 'desc' && messages.length > 0) {
					_this2.cache.add(options.ts, decoded_messages);
				}
				cb(null, decoded_messages);
			}).catch(function (err) {
				cb(err);
			});
		}
	}]);

	return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=datastore.js.map
