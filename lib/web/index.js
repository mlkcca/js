'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('../core');

var _core2 = _interopRequireDefault(_core);

var _auth = require('./auth');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var store = {
  get: function get(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  set: function set(key, data) {
    try {
      return localStorage.setItem(key, data);
    } catch (e) {
      return null;
    }
  }
};

var Milkcocoa = function (_MilkcocoaCore) {
  _inherits(Milkcocoa, _MilkcocoaCore);

  function Milkcocoa(options) {
    _classCallCheck(this, Milkcocoa);

    options.store = store;
    return _possibleConstructorReturn(this, (Milkcocoa.__proto__ || Object.getPrototypeOf(Milkcocoa)).call(this, options));
  }

  _createClass(Milkcocoa, [{
    key: 'version',
    value: function version() {
      return packageJSON.version;
    }
  }], [{
    key: 'authWithMilkcocoa',
    value: function authWithMilkcocoa(options, _callback) {
      (0, _auth.authWithMilkcocoa)(Object.assign({}, options.authOptions, { appId: options.appId, callback: function callback(accessToken) {
          console.log(accessToken);
          _callback(null, new Milkcocoa(Object.assign({}, options, { accessToken: accessToken })));
        } }));
    }
  }]);

  return Milkcocoa;
}(_core2.default);

exports.default = Milkcocoa;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
