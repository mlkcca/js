'use strict';

Object.defineProperty(exports, "__esModule", {
							value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _websocket = require('websocket');

var _websocket2 = _interopRequireDefault(_websocket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebSocketClient = _websocket2.default.client;

var _class = function () {
							function _class(conn) {
														_classCallCheck(this, _class);

														this.conn = conn;
							}

							_createClass(_class, [{
														key: 'init',
														value: function init() {
																					this.conn.on('error', function (error) {
																												console.log("Connection Error: " + error.toString());
																					});
																					this.conn.on('close', function () {
																												console.log('echo-protocol Connection Closed');
																					});
																					this.conn.on('message', function (message) {
																												var payload = JSON.parse(message.utf8Data);
																					});
																					this.conn.close();

																					function sendNumber() {
																												if (connection.connected) {
																																			sended++;
																																			var start = new Date().getTime();
																																			connection.sendUTF(JSON.stringify({
																																										e: getEventId(),
																																										p: 'topic',
																																										_t: 'p',
																																										_o: '_p',
																																										v: 'value'
																																			}));
																												}
																												setTimeout(sendNumber, span);
																					}
																					this.conn.sendUTF(JSON.stringify({
																												e: getEventId(),
																												p: 'topic',
																												_t: 's',
																												_o: '_p'
																					}));
																					sendNumber();
														}
							}, {
														key: 'send',
														value: function send(data) {
																					this.conn.sendUTF(JSON.stringify(data));
														}
							}, {
														key: 'close',
														value: function close() {
																					this.conn.close();
														}
							}]);

							return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=connection.js.map
