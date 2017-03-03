var http = require("http"),
    https = require('https'),
    querystring = require("querystring");
/*
method
utl
params
callback
secure
*/
function request(method, secure, host, port, path, qs, payload, headers, callback) {
	var http_client = secure ? https : http;
	//headers['Content-Type'] = 'application/x-www-form-urlencoded';

	if(qs) {
		path += "?" + querystring.stringify(qs);
	}

	var options = {
		hostname: host,
		port: port || (secure ? 443 : 80),
		path: path,
		method: method,
		headers : headers
	};

	if(method == 'GET') {
		http_client.get(options, process_response)
		.on('error', function (e) {
			callback(e);
		});
	}else{
		var req = http_client.request(options, process_response);
		req.setTimeout(5000);
		req.on('timeout', function() {
			if(callback) callback(new Error("timed out"), null);
			req.abort();
		});
		req.on('error', function(err) {
			if(callback) callback(err, null);
		});
		req.write(payload);
		req.end();
	}

	function process_response(res) {
		if(callback) {
			var content = "";
			res.on('data', function(str) {
				content += str;
			});
			res.on('end', function() {
				callback(null, JSON.parse(content));
			});
		}
	}
}

function requestBrowser(method, secure, host, _port, path, qs, payload, headers, callback) {
	let port = _port || (secure?443:80);
	var url = (secure?'https://':'http://') + host + ':' + port + path;
	if(qs) {
		url += "?" + querystring.stringify(qs);
	}
	var xhr = createCORSRequest(method , url);
	xhr.withCredentials = true;
	xhr.onload = function() {
		let decoded = "";
		try{
			var parsed = JSON.parse(xhr.responseText);
    		callback(null, parsed);
		}catch(e){
    		callback(null, JSON.parse(xhr.responseText));
		}
	}
	xhr.onerror = function() {
		callback(xhr.statusText || 'unknown error');
	}
	//xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	for(var header_key in headers) {
		xhr.setRequestHeader(header_key, headers[header_key]);
	}

	xhr.send(payload);
}

if ('browser' !== process.title) {
	module.exports = {
		request : request
	}
}else{
	module.exports = {
		request : requestBrowser
	}
}



function createCORSRequest(method, url) {
	console.log(url);
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}