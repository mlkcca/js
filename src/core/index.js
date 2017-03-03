import packageJSON from '../../package.json';
import Pubsub from './pubsub';
import Remote from './remote';
import DataStore from './datastore';

var eventId = 0;
export default class {
	constructor(options) {

		this.appId = options.appId;
		this.store = options.store;
		if(!this.appId) throw new Error('appId required');
		if(!this.store) throw new Error('store required');
		this.uuid = options.uuid;
		this.apiKey = options.apiKey;
		this.accessToken = options.accessToken;
		this.useSSL = options.hasOwnProperty('useSSL') ? options.useSSL : true;
		this.host = options.host || 'pubsub1.mlkcca.com';
		this.port = options.port || 443;
		this.keepaliveTimeout = options.keepaliveTimeout || 300;

	}

	version() {
		return packageJSON.version;
	}

	getAppId() {
		return this.appId;
	}

	connect() {
		this.websocket = new Pubsub({
			host: this._get_pubsub_url(this.useSSL, this.host, this.port, this.appId, this.apiKey, this.uuid),
			logger: console
		});
		this.websocket.connect();
	}

	_get_pubsub_url(ssl, host, port, appId, apikey, uuid) {
		return `ws${ssl?'s':''}://${host}:${port}/ws2/${appId}/${apikey}?uuid=${uuid}`;
	}

	dataStore(path) {
		return new DataStore(this.websocket, path);
	}

	grant() {

	}

	static history(options, cb) {
		let appId = options.appId;
		let apiKey = options.apiKey;
		let useSSL = options.hasOwnProperty('useSSL') ? options.useSSL : true;
		let host = options.host || 'pubsub1.mlkcca.com';
		let port = options.port || 443;
		var remote = new Remote(host, port, useSSL, {});
		remote.get(`/api/history/${appId}/${apiKey}`, {c:options.path}).then(function(messages) {
			cb(null, messages);
		}).catch(function(err) {
			cb(err);
		});
	}

	static grant() {

	}
}

function getEventId() {
	return eventId++;
}

function get_wsURL(host, appId, topic, apikey) {
  return `http://${host}/ws2/${appId}/${apikey}?uuid=ws1`;
}

/*

var recv = 0, sended = 0, diff_list = [], span = 80, span_d = -1;

setInterval(function() {
  console.log(span + "," + sended + "," + recv + "," + diff_list.reduce(function(acc, d) {return acc + d}, 0) / diff_list.length);
  sended = 0;
  recv = 0;
  diff_list = [];
  span += span_d;
  if(span < 15) {
  	span_d = 1;
  	//process.exit(0);
  }else if(span > 50) {
  	span_d = -1;
  }
}, 1000);

var host = "localhost:8000";
var appId = 'Bk9_7LVYg';
var apikey = "3mmUgPBrac35mW0R4HOq0CnerFFDg7eGp3Uw-eGi";
//var apikey = "eAgHtkrAOCaOdcl6QWqDE3PYZNKYMgRrPjDrYEk6";

Milkcocoa(host, "topic1", appId, apikey);




function Milkcocoa(host, topic, appId, apikey) {
	var client = new WebSocketClient();

	client.on('connectFailed', function(error) {
	    console.log('Connect Error: ' + error.toString());
	});

	client.on('connect', function(connection) {
	    console.log('WebSocket Client Connected');
	    connection.on('error', function(error) {
	        console.log("Connection Error: " + error.toString());
	    });
	    connection.on('close', function() {
	        console.log('echo-protocol Connection Closed');
	    });
	    connection.on('message', function(message) {
	    	console.log(message);
	    	var payload = JSON.parse(message.utf8Data);
	    	if(payload.message) {
		    var start = JSON.parse(payload.message);
		    var end = new Date().getTime();
		    var diff = end - start;
		    diff_list.push(diff);
		    recv++

	    	}

	        //console.log(message);
	        if (message.type === 'utf8') {
	            console.log("Received: '" + message.utf8Data + "'");
	        }
	        //setTimeout(sendNumber, 10);
	    });

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
        connection.sendUTF(JSON.stringify({
        	e: getEventId(),
        	p: 'topic',
        	_t: 's',
        	_o: '_p'
        }));
	    sendNumber();
	});

	client.connect(get_wsURL(host, appId, topic, apikey));
}

function getEventId() {
	return eventId++;
}

function get_wsURL(host, appId, topic, apikey) {
  return `http://${host}/ws2/${appId}/${apikey}?uuid=ws1`;
}
*/