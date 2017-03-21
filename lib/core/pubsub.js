'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _MessageStore = require('./MessageStore');

var _MessageStore2 = _interopRequireDefault(_MessageStore);

var _reinterval = require('reinterval');

var _reinterval2 = _interopRequireDefault(_reinterval);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
			if (cb) {
				this.removeListener(topic, cb);
			} else {
				this.removeAllListeners(topic);
			}
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

var _class = function (_EventEmitter2) {
	_inherits(_class, _EventEmitter2);

	function _class(options) {
		_classCallCheck(this, _class);

		var _this3 = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this));

		_this3.options = options;
		_this3.target = options.WebSocket;
		_this3.host = options.host;

		_this3.logger = options.logger;
		_this3.subscriberMan = new SubscriberManager();
		_this3.offlineQueue = [];
		_this3.messageStore = new _MessageStore2.default();
		_this3.wsOptions = options.wsOptions;
		_this3.reconnectPeriod = options.reconnectPeriod || 5000;
		_this3.reconnectTimer = null;
		_this3.pingTimer = null;
		_this3.pongArrived = true;
		_this3.state = 'offline';
		return _this3;
	}

	_createClass(_class, [{
		key: 'sendEvent',
		value: function sendEvent(event, params) {
			var result = null;
			switch (this.getState()) {
				case 'offline':
					result = this.offline(event, params);
					break;
				case 'connecting':
					result = this.connecting(event, params);
					break;
				case 'online':
					result = this.online(event, params);
					break;
				case 'disconnecting':
					result = this.disconnecting(event, params);
					break;
				default:
					console.error('unknow state');
			}
			if (result) {
				this.emit('state-changed', {
					currentState: this.state,
					nextState: result.nextState
				});
				this.logger.log('state changed from ' + this.state + ' to ' + result.nextState);
				this.state = result.nextState;
			}
		}
	}, {
		key: 'getState',
		value: function getState() {
			return this.state;
		}
	}, {
		key: 'offline',
		value: function offline(event) {
			if (event == 'connect') {
				this._connect();
				return {
					nextState: 'connecting'
				};
			} else {
				return null;
			}
		}
	}, {
		key: 'connecting',
		value: function connecting(event, params) {
			var _this4 = this;

			if (event == 'connect') {
				this.logger.warn('already connecting');
				return null;
			} else if (event == 'opened') {
				this.emit('open', {});
				this.subscriberMan.get().map(function (s) {
					_this4._subscribe(s.path, s.op, s.cb);
				});
				this.flushOfflineMessage();
				this._setupPingTimer();
				return {
					nextState: 'online'
				};
			} else if (event == 'error') {
				this._clean();
				this._setupReconnect();
				return null;
			} else if (event == 'closed') {
				this._clean();
				if (params.code > 1000) {
					this._setupReconnect();
					return null;
				} else {
					return {
						nextState: 'offline'
					};
				}
			} else {
				return null;
			}
		}
	}, {
		key: 'online',
		value: function online(event, params) {
			if (event == 'connect') {
				this.logger.warn('already connected');
				return null;
			} else if (event == 'opened') {
				this.logger.warn('already connected');
				return null;
			} else if (event == 'error') {
				this._clean();
				this._setupReconnect();
				return {
					nextState: 'connecting'
				};
			} else if (event == 'closed') {
				this._clean();
				if (params.code > 1000) {
					this._setupReconnect();
					return {
						nextState: 'connecting'
					};
				} else {
					return {
						nextState: 'offline'
					};
				}
			} else if (event == 'disconnect') {
				this._disconnect();
				return {
					nextState: 'disconnecting'
				};
			} else {
				return null;
			}
		}
	}, {
		key: 'disconnecting',
		value: function disconnecting(event) {
			if (event == 'error' || event == 'closed') {
				this._clean();
				return {
					nextState: 'offline'
				};
			} else {
				this.logger.warn('now disconnecting');
				return null;
			}
		}
	}, {
		key: 'connect',
		value: function connect() {
			this.sendEvent('connect', {});
		}
	}, {
		key: 'disconnect',
		value: function disconnect() {
			this.sendEvent('disconnect', {});
		}
	}, {
		key: 'publish',
		value: function publish(path, op, v, cb) {
			if (typeof v !== 'string') v = JSON.stringify(v);
			this.send({
				p: path,
				_t: 'p',
				_o: op,
				v: v
			}, cb);
		}
	}, {
		key: 'subscribe',
		value: function subscribe(path, op, cb, onComplete) {
			this.subscriberMan.reg(path, op, cb);
			this._subscribe(path, op, cb, onComplete);
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(path, op, cb) {
			this.subscriberMan.unreg(path, op, cb);
			this.send({
				p: path,
				_t: 'u',
				_o: op
			}, cb);
		}
	}, {
		key: '_connect',
		value: function _connect() {
			var _this5 = this;

			this.client = new WebSocket(this.target, this.host, this.wsOptions);
			this.client.on('error', function (error) {
				_this5.logger.error(error);
				_this5.sendEvent('error', {});
			});

			this.client.on('close', function (code) {
				_this5.logger.log('closed', code);
				_this5.sendEvent('closed', { code: code });
			});

			this.client.on('open', function () {
				_this5.sendEvent('opened', {});
			});

			this.client.on('message', function (utf8message) {
				var message = JSON.parse(utf8message);
				if (message.hasOwnProperty('e')) {
					_this5.response(message);
				} else {
					_this5.deliver(message);
				}
			});

			this.client.on('pong', function () {
				_this5._handlePong();
			});
		}
	}, {
		key: '_disconnect',
		value: function _disconnect() {
			this.client.close();
		}
	}, {
		key: '_setupReconnect',
		value: function _setupReconnect() {
			var _this6 = this;

			setTimeout(function () {
				_this6._connect();
			}, this.reconnectPeriod);
		}
	}, {
		key: 'response',
		value: function response(message) {
			this.messageStore.recvAck(message.e, message);
		}
	}, {
		key: 'deliver',
		value: function deliver(message) {
			this._resetPingInterval();
			this.subscriberMan.deliver(message.p, message);
		}
	}, {
		key: '_subscribe',
		value: function _subscribe(path, op, cb, onComplete) {
			this.send({
				p: path,
				_t: 's',
				_o: op
			}, onComplete);
		}
	}, {
		key: 'send',
		value: function send(message, cb) {
			this.messageStore.add(message, cb);
			if (this.client && this.getState() == 'online') {
				this.client.send(JSON.stringify(message));
				this._resetPingInterval();
			}
		}
	}, {
		key: 'flushOfflineMessage',
		value: function flushOfflineMessage() {
			var message = this.messageStore.enq();
			if (message) {
				this.client.send(JSON.stringify(message));
				this.flushOfflineMessage();
			}
		}
	}, {
		key: '_clean',
		value: function _clean() {
			this.client.close();
			this.client.clean();
			this.client = null;
			if (this.pingTimer !== null) {
				this.pingTimer.clear();
				this.pingTimer = null;
			}
			this.emit('close', {});
		}
	}, {
		key: '_setupPingTimer',
		value: function _setupPingTimer() {
			var _this7 = this;

			if (!this.pingTimer && this.options.keepalive) {
				this.pongArrived = true;
				this.pingTimer = (0, _reinterval2.default)(function () {
					_this7._checkPing();
				}, this.options.keepalive * 1000);
			}
		}
	}, {
		key: '_resetPingInterval',
		value: function _resetPingInterval() {
			if (this.pingTimer && this.options.keepalive) {
				this.pingTimer.reschedule(this.options.keepalive * 1000);
			}
		}
	}, {
		key: '_checkPing',
		value: function _checkPing() {
			if (this.pongArrived) {
				this.pongArrived = false;
				this.client.ping();
			} else {
				this.sendEvent('error', { message: 'pong not coming' });
			}
		}
	}, {
		key: '_handlePong',
		value: function _handlePong() {
			this.pongArrived = true;
		}
	}]);

	return _class;
}(EventEmitter);

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=pubsub.js.map
