'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
	function _class() {
		_classCallCheck(this, _class);
	}

	_createClass(_class, null, [{
		key: 'decode',
		value: function decode(message, type) {
			if (type == 'json') return this.json(message);else if (type == 'text') return this.text(message);else if (type == 'binary') return this.binary(message);else return this.text(message);
		}
	}, {
		key: 'json',
		value: function json(message) {
			var value = null;
			try {
				value = JSON.parse(message.v);
			} catch (e) {
				value = 'invalid json';
			}
			return {
				id: message.id,
				timestamp: Math.floor(message.t),
				value: value
			};
		}
	}, {
		key: 'text',
		value: function text(message) {
			return message;
		}
	}, {
		key: 'binary',
		value: function binary(message) {
			return message;
		}
	}]);

	return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=push.js.map
