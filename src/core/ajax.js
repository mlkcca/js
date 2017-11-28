var http = require('http')
var https = require('https')
var querystring = require('querystring')
var Agent = require('agentkeepalive')
var HttpsAgent = Agent.HttpsAgent

const keepaliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 300000,
  freeSocketKeepAliveTimeout: 30000
})

const keepaliveHttpsAgent = new HttpsAgent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 300000,
  freeSocketKeepAliveTimeout: 30000
})

/*
method
utl
params
callback
secure
*/
function request (method, secure, host, port, path, qs, payload, headers, callback) {
  var http_client = secure ? https : http
// headers['Content-Type'] = 'application/x-www-form-urlencoded';

  if (qs) {
    path += '?' + querystring.stringify(qs)
  }
// console.log('path', method, path, payload);

  var options = {
    hostname: host,
    port: port || (secure ? 443 : 80),
    path: path,
    method: method,
    headers: headers,
    agent: secure ? keepaliveHttpsAgent : keepaliveAgent
  }

  if (method === 'GET') {
    return http_client.get(options, process_response)
.on('error', function (e) {
  callback(e)
})
  } else {
    var req = http_client.request(options, process_response)
    req.setTimeout(120000)
    req.on('timeout', function () {
      if (callback) callback(new Error('timed out'), null)
      req.abort()
    })
    req.on('error', function (err) {
      if (callback) callback(err, null)
    })
    req.write(payload)
    req.end()
    return req
  }

  function process_response (res) {
    if (callback) {
      var content = ''
      res.on('data', function (str) {
        content += str
      })
      res.on('end', function () {
        let r = null
        try {
          r = JSON.parse(content)
        } catch (e) {
          callback(e)
        }
        if (r) { callback(null, r) }
      })
    }
  }
}

function requestBrowser (method, secure, host, _port, path, qs, payload, headers, callback) {
  let port = _port || (secure ? 443 : 80)
  var url = (secure ? 'https://' : 'http://') + host + ':' + port + path
  if (qs) {
    url += '?' + querystring.stringify(qs)
  }
  var xhr = createCORSRequest(method, url)
  xhr.withCredentials = true
  xhr.onload = function () {
    try {
      var parsed = JSON.parse(xhr.responseText)
      callback(null, parsed)
    } catch (e) {
      callback(null, JSON.parse(xhr.responseText))
    }
  }
  xhr.onerror = function () {
    callback(xhr.statusText || 'unknown error')
  }
// xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  for (var header_key in headers) {
    xhr.setRequestHeader(header_key, headers[header_key])
  }

  xhr.send(payload)
}

if (process.title !== 'browser') {
  module.exports = {
    request: request
  }
} else {
  module.exports = {
    request: requestBrowser
  }
}

function createCORSRequest (method, url) {
  var xhr = new XMLHttpRequest()
  if ('withCredentials' in xhr) {
    xhr.open(method, url, true)
  } else if (typeof XDomainRequest !== 'undefined') {
    xhr = new XDomainRequest()
    xhr.open(method, url)
  } else {
    xhr = null
  }
  return xhr
}
