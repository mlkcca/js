'use strict';

var http = require('http');
var https = require('https');
var querystring = require('querystring');
var Agent = require('agentkeepalive');
var HttpsAgent = Agent.HttpsAgent;

var keepaliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 300000,
  freeSocketKeepAliveTimeout: 30000
});

var keepaliveHttpsAgent = new HttpsAgent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 300000,
  freeSocketKeepAliveTimeout: 30000
});

function request(method, secure, host, port, path, qs, payload, headers, callback) {
  var httpClient = secure ? https : http;


  if (qs) {
    path += '?' + querystring.stringify(qs);
  }


  var options = {
    hostname: host,
    port: port || (secure ? 443 : 80),
    path: path,
    method: method,
    headers: headers,
    agent: secure ? keepaliveHttpsAgent : keepaliveAgent
  };

  if (method === 'GET') {
    return httpClient.get(options, processResponse).on('error', function (e) {
      callback(e);
    });
  } else {
    var req = httpClient.request(options, processResponse);
    req.setTimeout(120000);
    req.on('timeout', function () {
      if (callback) callback(new Error('timed out'), null);
      req.abort();
    });
    req.on('error', function (err) {
      if (callback) callback(err, null);
    });
    req.write(payload);
    req.end();
    return req;
  }

  function processResponse(res) {
    if (callback) {
      var content = '';
      res.on('data', function (str) {
        content += str;
      });
      res.on('end', function () {
        var r = null;
        try {
          r = JSON.parse(content);
        } catch (e) {
          callback(e);
        }
        if (r) {
          callback(null, r);
        }
      });
    }
  }
}

function requestBrowser(method, secure, host, _port, path, qs, payload, headers, callback) {
  var port = _port || (secure ? 443 : 80);
  var url = (secure ? 'https://' : 'http://') + host + ':' + port + path;
  if (qs) {
    url += '?' + querystring.stringify(qs);
  }
  var xhr = createCORSRequest(method, url);
  xhr.withCredentials = true;
  xhr.onload = function () {
    try {
      var parsed = JSON.parse(xhr.responseText);
      callback(null, parsed);
    } catch (e) {
      callback(null, JSON.parse(xhr.responseText));
    }
  };
  xhr.onerror = function () {
    callback(xhr.statusText || 'unknown error');
  };

  for (var headerKey in headers) {
    xhr.setRequestHeader(headerKey, headers[headerKey]);
  }

  xhr.send(payload);
}

if (process.title !== 'browser') {
  module.exports = {
    request: request
  };
} else {
  module.exports = {
    request: requestBrowser
  };
}

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ('withCredentials' in xhr) {
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest !== 'undefined') {
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    xhr = null;
  }
  return xhr;
}
//# sourceMappingURL=ajax.js.map
