const Milkcocoa = require('../lib/node');

var milkcocoa = new Milkcocoa({
	//host: 'localhost',
	//port: 8000,
	appId: 'SyBulv85x',
	apiKey: 'IUvC0v9k7coq7b-LOBZgGkqmYcS1Sja4gTSDfG7a',
	uuid: 'uuid1'
});
milkcocoa.connect();
//console.log(milkcocoa.version());
console.log(milkcocoa.getAppId());
var ds = milkcocoa.dataStore('topic');
ds.on('push', function(e) {
	console.log(e);
});
setInterval(function() {
	ds.push({message: "Hello!"}, function(result) {
		//console.log(result);
	});
}, 1000);

Milkcocoa.history({
	//host: 'localhost',
	//port: 8000,
	appId: 'SyBulv85x',
	apiKey: 'IUvC0v9k7coq7b-LOBZgGkqmYcS1Sja4gTSDfG7a',
	path: 'topic'
}, function(err, messages) {
	console.log(err, messages);
});
