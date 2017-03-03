'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ajax = require('./ajax');

var Remote = function () {
	function Remote(host, port, secure, headers) {
		_classCallCheck(this, Remote);

		this.host = host;
		this.port = port, this.secure = secure;
		this.headers = headers;
	}

	_createClass(Remote, [{
		key: 'post',
		value: function post(path, params) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				ajax.request('POST', _this.secure, _this.host, _this.port, path, null, JSON.stringify(params), _this.headers, function (err, data) {
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
					if (data.err) {
						return reject(data.err);
					}
					resolve(data.content);
				});
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

	return Remote;
}();

module.exports = Remote;
//# sourceMappingURL=remote.js.map
