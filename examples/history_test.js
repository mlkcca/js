const Milkcocoa = require('../lib/node');
const config = require('./config');

const apiKey = 'IUvC0v9k7coq7b-LOBZgGkqmYcS1Sja4gTSDfG7a';


var milkcocoa = new Milkcocoa(Object.assign({}, config, {uuid: 'uuid1', apiKey: apiKey}));
milkcocoa.connect();

var ds = milkcocoa.dataStore('topic', {datatype: 'json'});

ds.history({}, function(err, messages) {
	console.log(err, messages);
});
