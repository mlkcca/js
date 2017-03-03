'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebSocket = require('ws');

var _class = function () {
	function _class(options) {
		_classCallCheck(this, _class);

		this.host = options.host;

		this.connected = false;
		this.connection = null;
		this.logger = options.logger;
		this.messageHandler = function () {};
		this.requestId = 0;
		this.requestMap = {};
		this.subscribers = {};
		this.offlineQueue = [];
		this.wsOptions = options.wsOptions;
		this.init();
	}

	_createClass(_class, [{
		key: 'init',
		value: function init(messageHandler, closeHandler, errorHandler) {}
	}, {
		key: 'connect',
		value: function connect() {
			var _this = this;

			if (!this.connected) {
				console.log(this.wsOptions);
				this.client = new WebSocket(this.host, this.wsOptions);
				this.client.on('error', function (error) {
					_this.logger.error(error);
					_this.clean();
				});

				this.client.on('close', function () {
					_this.logger.log('closed');
					_this.clean();
				});

				this.client.on('open', function () {
					_this.logger.log('connected');
					_this.connected = true;
					_this.flushOfflineMessage();
				});

				this.client.on('message', function (utf8message) {
					var message = JSON.parse(utf8message);
					if (message.hasOwnProperty('e')) {
						_this.response(message);
					} else {
						_this.deliver(message);
					}
				});
			} else {
				this.logger.warn('already connected');
			}
		}
	}, {
		key: 'response',
		value: function response(message) {
			var cb = this.requestMap[message.e];
			if (cb) cb(message);
			this.unregisterCallback(message.e);
		}
	}, {
		key: 'deliver',
		value: function deliver(message) {
			this.subscribers[message.p](message);
		}
	}, {
		key: 'publish',
		value: function publish(path, op, v, cb) {
			if (typeof v !== 'string') v = JSON.stringify(v);
			this.send({
				e: this.registerCallback(cb),
				p: path,
				_t: 'p',
				_o: op,
				v: v
			});
		}
	}, {
		key: 'subscribe',
		value: function subscribe(path, op, cb, onComplete) {
			this.subscribers[path + '/' + op] = cb;
			this.send({
				e: this.registerCallback(onComplete),
				p: path,
				_t: 's',
				_o: op
			});
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(path, op, cb) {
			this.send({
				e: this.registerCallback(cb),
				p: path,
				_t: 'u',
				_o: op
			});
		}
	}, {
		key: 'send',
		value: function send(message) {
			if (this.connected) {
				this.client.send(JSON.stringify(message));
			} else {
				this.offlineQueue.push(message);
				this.logger.warn('connection closed');
			}
		}
	}, {
		key: 'flushOfflineMessage',
		value: function flushOfflineMessage() {
			var _this2 = this;

			if (this.connected) {
				this.offlineQueue.forEach(function (m) {
					_this2.send(m);
				});
				this.offlineQueue = [];
			} else {
				this.logger.warn('connection closed');
			}
		}
	}, {
		key: 'close',
		value: function close() {
			if (this.connected) {
				this.client.close();
			} else {
				this.logger.warn('already closed');
			}
		}
	}, {
		key: 'clean',
		value: function clean() {
			this.connected = false;
			this.connection = null;
		}
	}, {
		key: 'registerCallback',
		value: function registerCallback(cb) {
			var rid = this.getRequestId();
			this.requestMap[rid] = cb;
			return rid;
		}
	}, {
		key: 'unregisterCallback',
		value: function unregisterCallback(rid) {
			delete this.requestMap[rid];
		}
	}, {
		key: 'getRequestId',
		value: function getRequestId() {
			if (this.requestId > 100000) this.requestId = 0;
			return this.requestId++;
		}
	}]);

	return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=pubsub.js.map
