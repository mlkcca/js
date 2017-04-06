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

var EventEmitter = require("events").EventEmitter;

var SubscriberManager = function (_EventEmitter) {
	_inherits(SubscriberManager, _EventEmitter);

	function SubscriberManager(root, op) {
		_classCallCheck(this, SubscriberManager);

		var _this = _possibleConstructorReturn(this, (SubscriberManager.__proto__ || Object.getPrototypeOf(SubscriberManager)).call(this));

		_this.root = root;
		_this.op = op;
		_this.subscribers = {};
		_this.timestamp = 0;
		_this.caller = null;
		return _this;
	}

	_createClass(SubscriberManager, [{
		key: 'reg',
		value: function reg(path, cb, onComplete) {
			this.subscribers[path] = { cb: cb };
			this.on(path, cb);
			this._startSubscribe(onComplete);
		}
	}, {
		key: '_get_path_list',
		value: function _get_path_list() {
			return Object.keys(this.subscribers);
		}
	}, {
		key: '_startSubscribe',
		value: function _startSubscribe(onComplete) {
			var _this2 = this;

			this._stopSubscribe();
			var apiUrl = this.root._get_on_url(this.op || 'push');
			var pathList = this._get_path_list();
			if (pathList.length == 0) return;
			var path = pathList.join(',');
			this.caller = this.root._get_remote().get2(apiUrl, Object.assign({ c: path, t: this.timestamp }, {}), function (err, res) {
				if (err) {
					if (onComplete) onComplete(err);
					setTimeout(function () {
						_this2._startSubscribe();
					}, 5000);
					return;
				}
				if (res.err) {
					if (res.err == 'permission_denied') {
						if (onComplete) onComplete(res.err);
					} else {
						if (onComplete) onComplete(res.err);
					}
				} else {
					Object.keys(res).forEach(function (key) {
						if (_this2.timestamp < res[key][0][0]) _this2.timestamp = res[key][0][0];
						res[key].reverse().map(function (m) {
							if (m.length == 2) {
								return {
									t: m[0],
									v: m[1]
								};
							} else if (m.length == 3) {
								return {
									id: m[1],
									t: m[0],
									v: m[2]
								};
							}
						}).forEach(function (m) {
							_this2.emit(key, m);
						});
					});
					_this2._startSubscribe();
				}
			});
		}
	}, {
		key: '_stopSubscribe',
		value: function _stopSubscribe() {
			if (this.caller) this.caller.abort();
		}
	}, {
		key: 'unreg',
		value: function unreg(path, cb) {
			delete this.subscribers[path];
			if (cb) {
				this.removeListener(path, cb);
			} else {
				this.removeAllListeners(path);
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
			var _this3 = this;

			return Object.keys(this.subscribers).map(function (topic) {
				return _this3.subscribers[topic];
			});
		}
	}]);

	return SubscriberManager;
}(EventEmitter);

var _class = function (_EventEmitter2) {
	_inherits(_class, _EventEmitter2);

	function _class(options, root) {
		_classCallCheck(this, _class);

		var _this4 = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this));

		_this4.options = options;
		_this4.root = root;
		_this4.host = options.host;
		_this4.logger = options.logger;
		_this4.subscriberMan = {};
		_this4.subscriberMan.push = new SubscriberManager(root, 'push');
		_this4.subscriberMan.set = new SubscriberManager(root, 'set');
		_this4.subscriberMan.send = new SubscriberManager(root, 'send');
		_this4.offlineQueue = [];
		_this4.messageStore = new _MessageStore2.default();
		_this4.wsOptions = options.wsOptions;
		_this4.reconnectPeriod = options.reconnectPeriod || 5000;
		_this4.reconnectTimer = null;
		_this4.pingTimer = null;
		_this4.pongArrived = true;
		_this4.state = 'offline';
		return _this4;
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
			if (event == 'connect') {
				this.logger.warn('already connecting');
				return null;
			} else if (event == 'opened') {
				this.emit('open', {});

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
		value: function publish(path, op, v, cb, _options) {
			var _this5 = this;

			var options = _options || {};

			v = JSON.stringify(v);
			var rid = this.messageStore.add({ path: path, op: op, v: v, options: _options }, cb);
			var apiUrl = this.root._get_api_url(op || 'push');
			var retryTimer = setTimeout(function () {
				_this5.flushOfflineMessage(function () {});
			}, 10000);
			this.root._get_remote().get(apiUrl, Object.assign({ c: path, v: v }, _options)).then(function (res) {
				_this5.messageStore.recvAck(rid, res);
				clearTimeout(retryTimer);
			}).catch(function (err) {
				cb(err);
			});
		}
	}, {
		key: 'flushOfflineMessage',
		value: function flushOfflineMessage(cb) {
			var _this6 = this;

			var message = this.messageStore.enq();
			if (message) {
				var mes = message.message;
				var rid = message.id;
				var apiUrl = this.root._get_api_url(mes.op || 'push');
				this.root._get_remote().get(apiUrl, Object.assign({ c: mes.path, v: mes.v }, mes.options)).then(function (res) {
					_this6.messageStore.recvAck(rid, res);
					_this6.flushOfflineMessage(cb);
				}).catch(function (err) {
					cb(err);
				});
			} else {
				cb(null);
			}
		}
	}, {
		key: 'subscribe',
		value: function subscribe(path, op, cb, onComplete) {
			this.subscriberMan[op].reg(path, cb, onComplete);
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(path, op, cb) {
			this.subscriberMan[op].unreg(path, cb);
		}
	}, {
		key: '_setupReconnect',
		value: function _setupReconnect() {
			var _this7 = this;

			setTimeout(function () {
				_this7._connect();
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
			var _this8 = this;

			if (!this.pingTimer && this.options.keepalive) {
				this.pongArrived = true;
				this.pingTimer = (0, _reinterval2.default)(function () {
					_this8._checkPing();
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
