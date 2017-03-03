const assert = require("assert");
const Milkcocoa = require('../lib/node');

var milkcocoa = new Milkcocoa({appId: 'demo', uuid: 'uuid1', apiKey: 'demo'});
milkcocoa.connect();

describe("milkcocoa", function() {

    it("getAppId", function() {
        assert.equal('demo', milkcocoa.getAppId());
    });

	describe("datastore", function() {
	    it("history", function(done) {
			var ds = milkcocoa.dataStore('topic', {datatype: 'json'});

			ds.history({}, function(err, messages) {
	        	assert.equal(null, err);
	        	assert.equal(true, messages.length>0);
				done();
			});
	    });

	});

});



