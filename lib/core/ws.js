'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isBrowser = 'browser' === process.title;

var EventEmitter = require("events").EventEmitter;

var _class = function (_EventEmitter) {
	_inherits(_class, _EventEmitter);

	function _class(Module, host, options) {
		_classCallCheck(this, _class);

		var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this));

		if (isBrowser) {
			_this.client = new Module(host);
			_this.client.onerror = _this.fire('error');
			_this.client.onclose = _this.fire('close');
			_this.client.onopen = _this.fire('open');
			_this.client.onmessage = function (msg) {
				_this.emit('message', msg.data);
			};
		} else {
			_this.client = new Module(host, options);
			_this.client.on('error', _this.fire('error'));
			_this.client.on('close', _this.fire('close'));
			_this.client.on('open', _this.fire('open'));
			_this.client.on('message', _this.fire('message'));
		}
		return _this;
	}

	_createClass(_class, [{
		key: 'send',
		value: function send(msg) {
			this.client.send(msg);
		}
	}, {
		key: 'fire',
		value: function fire(e) {
			var _this2 = this;

			return function (params) {
				_this2.emit(e, params);
			};
		}
	}, {
		key: 'close',
		value: function close(code, reason) {
			this.client.close(code, reason);
		}
	}, {
		key: 'clean',
		value: function clean() {
			this.removeAllListeners('error');
			this.removeAllListeners('close');
			this.removeAllListeners('open');
			this.removeAllListeners('message');
		}
	}]);

	return _class;
}(EventEmitter);

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=ws.js.map
