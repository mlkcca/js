const Milkcocoa = require('../lib/node');
const config = require('./config');

const apiKey = 'IUvC0v9k7coq7b-LOBZgGkqmYcS1Sja4gTSDfG7a';


var milkcocoa = new Milkcocoa(Object.assign({}, config, {uuid: 'uuid1'}));

var ds = milkcocoa.dataStore('topic', {datatype: 'json'});

ds.on('set', function(e) {
	console.log(e);
});


var count = 0;
setInterval(function() {
	ds.set("id" + count, {message: "hello, id" + count + "."}, function(result) {
		console.log(result);
	});
	count++;
}, 100)
