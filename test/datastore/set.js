const assert = require('assert')
const Milkcocoa = require('../../lib/node')

function Set (uuid) {
  const milkcocoa = new Milkcocoa({appId: 'demo', uuid: 'uuid-' + uuid, apiKey: 'demo'})

  describe('set()', function () {
    it('should call the onCompleteCallback whose err is null.', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/set', {datatype: 'json'})
      ds.set('set-test', {message: 'Hello set!'}, function (err, result) {
        if (err) done()
        assert.equal(null, err)
        done()
      })
    })
  })

  describe('on(set)', function () {
    this.timeout(3000)
    it('should be called by set() and have the set data.', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/set', {datatype: 'json'})
      ds.on('set', function (payload) {
        assert.equal('set-test-on', payload.id)
        assert.deepEqual({message: 'Hello onset!'}, payload.value)
        done()
      })
      ds.set('set-test-on', {message: 'Hello onset!'})
    })
  })

  describe('history()', function () {
    this.timeout(3000)
    it('should retrieve set data.', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/set', {datatype: 'json'})
      ds.history({}, function (err, messages) {
        assert.equal(null, err)
        assert.equal('set-test-on', messages[0].id)
        assert.deepEqual({message: 'Hello onset!'}, messages[0].value)
        assert.equal('set-test', messages[1].id)
        assert.deepEqual({message: 'Hello set!'}, messages[1].value)
        done()
      })
    })
  })
}

module.exports = Set
