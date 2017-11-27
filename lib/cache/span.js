"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(ts, data) {
    _classCallCheck(this, _class);

    this.ts = ts;
    this.data = data;
    this.tailTs = this.data[this.data.length - 1].t;
  }

  _createClass(_class, [{
    key: "combine",
    value: function combine(span) {
      if (this.ts >= span.getTailTs() && span.ts >= this.getTailTs()) {
        this.data = this.mergeData(this.data, span.data);
        this.ts = Math.max(this.ts, span.ts);
        this.tailTs = Math.min(this.getTailTs(), span.getTailTs());
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: "mergeData",
    value: function mergeData(d1, d2) {
      var d = d1.concat(d2);
      var idList = {};
      var dd = d.filter(function (d) {
        if (idList[d.id]) {
          return false;
        } else {
          idList[d.id] = true;
          return true;
        }
      });
      dd.sort(function (a, b) {
        if (a.t > b.t) return -1;else if (a.t < b.t) return 1;else return 0;
      });
      return dd;
    }
  }, {
    key: "getTailTs",
    value: function getTailTs() {
      return this.tailTs;
    }
  }, {
    key: "query",
    value: function query(ts, limit) {
      if (this.ts >= ts) {
        var data = this.getData(ts);
        if (data.length >= limit) {
          return data.slice(0, limit);
        }
      }
      return null;
    }
  }, {
    key: "getData",
    value: function getData(ts) {
      return this.data.filter(function (d) {
        return d.t <= ts;
      });
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports["default"];
//# sourceMappingURL=span.js.map
