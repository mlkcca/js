const assert = require('assert')
const Milkcocoa = require('../../lib/node')

var milkcocoa = new Milkcocoa({appId: 'demo', uuid: 'uuid1', apiKey: 'demo'})

function History () {
  describe('history()', function () {
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

      ds.history({ts: 1493027628099, limit: 2, useCache: true}, function (err1, messages1) {
        ds.history({ts: 1493027628099, limit: 2, useCache: true}, function (err2, messages2) {
          console.log(err2, messages2)
          assert.equal(null, err2)
          assert.equal(true, messages2.length === 2)
          assert.equal(true, messages2[0].hasOwnProperty('value'))
          done()
        })
      })
    })
  })
}

module.exports = History