'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.authWithMilkcocoa = authWithMilkcocoa;
function authWithMilkcocoa(options) {
	var appId = options.appId;
	var transport = options.transport || 'window';
	var windowTitle = options.windowTitle || 'Login';
	var endpoint = options.endpoint || 'https://milkcocoav3.herokuapp.com';
	var callback = options.callback;

	if (!callback) throw new Error('callback should be setted');

	var url = endpoint + ('/auth-api/auth/' + appId + '/mlkcca?redirect_uri=') + encodeURIComponent(window.location.href);

	if (transport == 'window') transport_window(url);else if (transport == 'redirect') transport_window(url);else throw new Error('invalid transport');

	function transport_redirect(url) {
		window.location = url;
	}

	function transport_window(url) {
		var window_features = {
			'menubar': 1,
			'location': 0,
			'resizable': 0,
			'scrollbars': 1,
			'status': 0,
			'dialog': 1,
			'width': 700,
			'height': 375
		};

		var child = window.open(url, windowTitle, window_features);

		addListener(child, 'unload', function () {});

		addListener(window, 'message', function (e) {
			if (e && e.data) callback(e.data);
		});
	}

	function addListener(w, event, cb) {
		if (w['attachEvent']) w['attachEvent']('on' + event, cb);else if (w['addEventListener']) w['addEventListener'](event, cb, false);
	}
}
//# sourceMappingURL=auth.js.map