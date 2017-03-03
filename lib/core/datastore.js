'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _push = require('./datatypes/push');

var _push2 = _interopRequireDefault(_push);

var _send = require('./datatypes/send');

var _send2 = _interopRequireDefault(_send);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
	function _class(root, path, _options) {
		_classCallCheck(this, _class);

		this.root = root;
		this.path = path;
		var options = _options || {};
		this.setDataType(options.datatype || 'json');
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
			var apiUrl = this.root._get_api_url('history');
			var params = {
				c: this.path
			};
			if (options.limit) params.limit = options.limit;
			if (options.order) params.order = options.order;
			if (options.ts) params.ts = options.ts;

			this.root._get_remote().get(apiUrl, params).then(function (messages) {
				cb(null, messages);
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
