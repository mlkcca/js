'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _span = require('./span');

var _span2 = _interopRequireDefault(_span);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
	function _class(options) {
		_classCallCheck(this, _class);

		this.spanList = [];
	}

	_createClass(_class, [{
		key: 'add',
		value: function add(ts, data) {
			var span = new _span2.default(ts, data);
			this.spanList.push(span);
			this.combine();
		}
	}, {
		key: 'combine',
		value: function combine() {
			this.spanList = this.spanList.reduce(function (acc, s) {
				if (acc.length == 0) {
					return [s];
				} else {
					if (acc[0].combine(s)) {
						return acc;
					} else {
						return acc.concat([s]);
					}
				}
			}, []);
		}
	}, {
		key: 'query',
		value: function query(ts, limit) {
			for (var i = 0; i < this.spanList.length; i++) {
				var s = this.spanList[i];
				var data = s.query(ts, limit);
				if (data !== null) {
					return data;
				}
			}
			return null;
		}
	}]);

	return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
