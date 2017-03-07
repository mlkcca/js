const assert = require("assert");
const Milkcocoa = require('../lib/node');

var milkcocoa = new Milkcocoa({appId: 'demo', uuid: 'uuid1', apiKey: 'demo'});
milkcocoa.connect();

describe("milkcocoa", function() {

    it("getAppId", function() {
        assert.equal('demo', milkcocoa.getAppId());
    });

	describe("datastore", function() {
		describe("history", function() {
			this.timeout(3000);

		    it("no option", function(done) {
				var ds = milkcocoa.dataStore('topic', {datatype: 'json'});

				ds.history({}, function(err, messages) {
		        	assert.equal(null, err);
		        	assert.equal(true, messages.length>0);
					done();
				});
		    });

		    it("ts", function(done) {
				var ds = milkcocoa.dataStore('topic', {datatype: 'json'});

				ds.history({ts:1488533359269,limit:2}, function(err, messages) {
		        	assert.equal(null, err);
		        	assert.equal(true, messages.length==2);
					done();
				});
		    });

		});


		describe("send", function() {
			this.timeout(3000);

		    it("success to send data", function(done) {
				var ds = milkcocoa.dataStore('topic', {datatype: 'json'});

				ds.on('send', function(data) {
		        	assert.deepEqual({value:{message:'Hello'}}, data);
					done();
				});
				ds.send({message:'Hello'});
		    });

		});

	});

});



