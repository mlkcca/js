const assert = require('assert')
const Milkcocoa = require('../../lib/node')
const uuidv4 = require('uuid/v4')

function Set (uuid) {
  const milkcocoa = new Milkcocoa({appId: 'demo', uuid: 'uuid-' + uuid + '-set', apiKey: 'demo'})

  describe('set()', function () {
    it('should call the onCompleteCallback whose err is null.', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/set')
      ds.set('set-test', {message: 'Hello set!'}, function (err) {
        if (err) done()
        assert.equal(null, err)
        done()
      })
    })
  })

  describe('on(set)', function () {
    this.timeout(3000)
    it('should be called by set() and have the set data.', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/set')
      ds.on('set', function (payload) {
        assert.equal('set-test-on', payload.id)
        assert.deepEqual({message: 'Hello onset!'}, payload.value)
        assert.equal('number', typeof payload.timestamp)
        done()
      })
      setTimeout(function () {
        ds.set('set-test-on', {message: 'Hello onset!'})
      }, 100)
    })
  })

  describe('history()', function () {
    this.timeout(3000)
    it('should retrieve set data.', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/set')
      ds.history({}, function (err, messages) {
        assert.equal(null, err)
        assert.equal('set-test-on', messages[0].id)
        assert.deepEqual({message: 'Hello onset!'}, messages[0].value)
        assert.equal('set-test', messages[1].id)
        assert.deepEqual({message: 'Hello set!'}, messages[1].value)
        assert.equal(true, isNaN(messages[0].timestamp))
        done()
      })
    })
  })
}

Set(global.uuid || uuidv4())

module.exports = Set
