const assert = require('assert')
const Milkcocoa = require('../lib/node')

var milkcocoa = new Milkcocoa({appId: 'demo', uuid: 'uuid1', apiKey: 'demo'})

describe('milkcocoa', function () {
  it('getAppId', function () {
    assert.equal('demo', milkcocoa.getAppId())
  })

  describe('datastore', function () {
    describe('history', function () {
      this.timeout(3000)

      it('no option', function (done) {
        var ds = milkcocoa.dataStore('demo', {datatype: 'json'})

        ds.history({}, function (err, messages) {
          assert.equal(null, err)
          assert.equal(true, messages.length > 0)
          done()
        })
      })

      it('ts', function (done) {
        var ds = milkcocoa.dataStore('demo', {datatype: 'json'})

        ds.history({ts: 1493027628099, limit: 2}, function (err, messages) {
          console.log(err, messages)
          assert.equal(null, err)
          assert.equal(true, messages.length === 2)
          done()
        })
      })

      it('cache', function (done) {
        var ds = milkcocoa.dataStore('demo', {datatype: 'json'})

        ds.history({ts: 1493027628099, limit: 2, useCache: true}, function (err, messages) {
          ds.history({ts: 1493027628099, limit: 2, useCache: true}, function (err, messages) {
            console.log(err, messages)
            assert.equal(null, err)
            assert.equal(true, messages.length === 2)
            assert.equal(true, messages[0].hasOwnProperty('value'))
            done()
          })
        })
      })
    })

    describe('send', function () {
      this.timeout(3000)

      it('success to send data', function (done) {
        var ds = milkcocoa.dataStore('topic', {datatype: 'json'})

        ds.on('send', function (data) {
          assert.deepEqual({value: {message: 'Hello'}}, data)
          done()
        })
        ds.send({message: 'Hello'})
      })
    })
  })
})
