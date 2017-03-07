'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebSocket = require('./ws');
var EventEmitter = require("events").EventEmitter;

var SubscriberManager = function (_EventEmitter) {
	_inherits(SubscriberManager, _EventEmitter);

	function SubscriberManager() {
		_classCallCheck(this, SubscriberManager);

		var _this = _possibleConstructorReturn(this, (SubscriberManager.__proto__ || Object.getPrototypeOf(SubscriberManager)).call(this));

		_this.subscribers = {};
		return _this;
	}

	_createClass(SubscriberManager, [{
		key: 'reg',
		value: function reg(path, op, cb) {
			var topic = path + '/' + op;
			this.subscribers[topic] = { path: path, op: op, cb: cb };
			this.on(topic, cb);
		}
	}, {
		key: 'unreg',
		value: function unreg(path, op, cb) {
			var topic = path + '/' + op;
			delete this.subscribers[topic];
			this.removeListener(topic, cb);
		}
	}, {
		key: 'deliver',
		value: function deliver(topic, message) {
			this.emit(topic, message);
		}
	}, {
		key: 'get',
		value: function get() {
			var _this2 = this;

			return Object.keys(this.subscribers).map(function (topic) {
				return _this2.subscribers[topic];
			});
		}
	}]);

	return SubscriberManager;
}(EventEmitter);

var _class = function () {
	function _class(options) {
		_classCallCheck(this, _class);

		this.target = options.WebSocket;
		this.host = options.host;

		this.connected = false;
		this.logger = options.logger;
		this.requestId = 0;
		this.requestMap = {};
		this.subscriberMan = new SubscriberManager();
		this.offlineQueue = [];
		this.wsOptions = options.wsOptions;
		this.reconnectPeriod = options.reconnectPeriod || 5000;
	}

	_createClass(_class, [{
		key: 'connect',
		value: function connect() {
			var _this3 = this;

			if (!this.connected) {
				this.client = new WebSocket(this.target, this.host, this.wsOptions);
				this.client.on('error', function (error) {
					_this3.logger.error(error);
					_this3.clean();
					_this3._setupReconnect();
				});

				this.client.on('close', function (e) {
					_this3.logger.log('closed', e);
					_this3.clean();
					if (e.code > 1000) _this3._setupReconnect();
				});

				this.client.on('open', function () {
					_this3.logger.log('connected');
					_this3.connected = true;
					_this3.subscriberMan.get().map(function (s) {
						_this3._subscribe(s.path, s.op, s.cb);
					});
					_this3.flushOfflineMessage();
				});

				this.client.on('message', function (utf8message) {
					var message = JSON.parse(utf8message);
					if (message.hasOwnProperty('e')) {
						_this3.response(message);
					} else {
						_this3.deliver(message);
					}
				});
			} else {
				this.logger.warn('already connected');
			}
		}
	}, {
		key: 'disconnect',
		value: function disconnect() {
			if (this.connected) {
				this.client.close();
			} else {
				this.logger.warn('already disconnected');
			}
		}
	}, {
		key: '_setupReconnect',
		value: function _setupReconnect() {
			var _this4 = this;

			setTimeout(function () {
				_this4.connect();
			}, this.reconnectPeriod);
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
			this.subscriberMan.deliver(message.p, message);
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
			this.subscriberMan.reg(path, op, cb);
			this._subscribe(path, op, cb, onComplete);
		}
	}, {
		key: '_subscribe',
		value: function _subscribe(path, op, cb, onComplete) {
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
			this.subscriberMan.unreg(path, op, cb);
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
				this.logger.log('offline send');
			}
		}
	}, {
		key: 'flushOfflineMessage',
		value: function flushOfflineMessage() {
			var _this5 = this;

			if (this.connected) {
				this.offlineQueue.forEach(function (m) {
					_this5.send(m);
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
			this.client.close();
			this.connected = false;
			this.client.clean();
			this.client = null;
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
