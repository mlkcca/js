const Milkcocoa = require('../lib/node');
const config = require('./config');


var milkcocoa = new Milkcocoa(Object.assign({}, config, {uuid: 'uuid1'}));


var ds = milkcocoa.dataStore('remote-bench1-1', {datatype: 'json'});
//var ds = milkcocoa.dataStore('aaa', {datatype: 'json'});
//var aaa_ds = milkcocoa.dataStore('remote-bench1-1', {datatype: 'json'});

ds.on('push', function(e) {
	console.log(new Date(e.timestamp).toLocaleString());
});
/*
ds.on('set', function(e) {
	console.log(e);
});
aaa_ds.on('push', function(e) {
	console.log(e);
});
ds.push({message: "Hello!"}, function(result) {
	console.log(result);
});
*/