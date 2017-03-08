const Milkcocoa = require('../lib/node');
const config = require('./config');

const apiKey = '3MVRMdXi7LfmRnw-UM55rf3v8P79IdfLxXqDzD3A';


var milkcocoa = new Milkcocoa(Object.assign({}, config, {uuid: 'uuid1', apiKey: apiKey}));

console.log(milkcocoa.getAppId());

var ds = milkcocoa.dataStore('message', {datatype: 'json'});

ds.on('push', function(e) {
	console.log(e);
});
