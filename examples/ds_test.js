const Milkcocoa = require('../lib/node');
const config = require('./config');

var milkcocoa = new Milkcocoa(Object.assign({}, config, {uuid: 'uuid1'}));

milkcocoa.listDataStores({c:'d'}, function(err, result) {
	console.log(err, result);
});