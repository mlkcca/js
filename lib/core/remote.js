'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ajax = require('./ajax');

var _class = function () {
  function _class(host, port, secure, headers) {
    _classCallCheck(this, _class);

    this.host = host;
    this.port = port;
    this.secure = secure;
    this.headers = headers;
  }

  _createClass(_class, [{
    key: 'post',
    value: function post(path, params, _qs, _headers) {
      var _this = this;

      var qs = _qs || null;
      var headers = Object.assign({}, this.headers, _headers);
      return new Promise(function (resolve, reject) {
        ajax.request('POST', _this.secure, _this.host, _this.port, path, qs, JSON.stringify(params), headers, function (err, data) {
          if (err) {
            return reject(err);
          }
          if (data.err) {
            return reject(data.err);
          }
          resolve(data.content);
        });
      });
    }
  }, {
    key: 'get',
    value: function get(path, params) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        ajax.request('GET', _this2.secure, _this2.host, _this2.port, path, params, null, _this2.headers, function (err, data) {
          if (err) {
            return reject(err);
          }

          resolve(data);
        });
      });
    }
  }, {
    key: 'get2',
    value: function get2(path, params, cb) {
      return ajax.request('GET', this.secure, this.host, this.port, path, params, null, this.headers, function (err, data) {
        if (err) {
          return cb(err);
        }
        cb(null, data);
      });
    }
  }, {
    key: 'put',
    value: function put(path, params) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        ajax.request('PUT', _this3.secure, _this3.host, _this3.port, path, null, JSON.stringify(params), _this3.headers, function (err, data) {
          if (err) {
            return reject(err);
          }
          if (data.err) {
            return reject(data.err);
          }
          resolve(data.content);
        });
      });
    }
  }, {
    key: 'delete',
    value: function _delete(path, params) {
      var _this4 = this;

      var qs = {};
      Object.keys(params).forEach(function (k) {
        qs[k] = JSON.stringify(params[k]);
      });
      return new Promise(function (resolve, reject) {
        ajax.request('DELETE', _this4.secure, _this4.host, _this4.port, path, qs, null, _this4.headers, function (err, data) {
          if (err) {
            return reject(err);
          }
          if (data.err) {
            return reject(data.err);
          }
          resolve(data.content);
        });
      });
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=remote.js.map
