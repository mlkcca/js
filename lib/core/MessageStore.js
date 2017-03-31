"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
	function _class() {
		_classCallCheck(this, _class);

		this.requestId = 0;
		this.messages = [];
	}

	_createClass(_class, [{
		key: "add",
		value: function add(message, onAck) {
			var rid = this.getRequestId();
			this.messages.push({
				id: rid,
				message: message,
				cb: onAck
			});
			return rid;
		}
	}, {
		key: "recvAck",
		value: function recvAck(rid, args) {
			var m = this.messages.filter(function (m) {
				return m.id === rid;
			})[0];
			if (m && m.cb) m.cb(args);
			this.messages = this.messages.filter(function (m) {
				return m.id !== rid;
			});
		}
	}, {
		key: "enq",
		value: function enq() {
			var message = this.messages.shift();
			if (message) return message;else return null;
		}
	}, {
		key: "getRequestId",
		value: function getRequestId() {
			if (this.requestId > 100000) this.requestId = 0;
			return this.requestId++;
		}
	}]);

	return _class;
}();

exports.default = _class;
module.exports = exports["default"];
//# sourceMappingURL=MessageStore.js.map
