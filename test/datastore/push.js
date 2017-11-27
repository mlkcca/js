const assert = require('assert')
const Milkcocoa = require('../../lib/node')

function Push (uuid) {
  const milkcocoa = new Milkcocoa({appId: 'demo', uuid: 'uuid-' + uuid, apiKey: 'demo'})

  describe('push()', function () {
    it('should call the onCompleteCallback whose argument is the same data.', function (done) {
      let ds = milkcocoa.dataStore(uuid, {datatype: 'json'})
      ds.push({message: 'Hello push!'}, function (err, result) {
        if (err) done()
        assert.equal(null, err)
        assert.deepEqual({message: 'Hello push!'}, result.value)
        done()
      })
    })
  })

  describe('on(push)', function () {
    this.timeout(3000)
    it('should be called by push() and have the pushed data.', function (done) {
      let ds = milkcocoa.dataStore(uuid, {datatype: 'json'})
      ds.on('push', function (payload) {
        assert.deepEqual({message: 'Hello onpush!'}, payload.value)
        done()
      })
      ds.push({message: 'Hello onpush!'})
    })
  })

  describe('history()', function () {
    this.timeout(3000)
    it('should retrieve pushed data.', function (done) {
      let ds = milkcocoa.dataStore(uuid, {datatype: 'json'})
      ds.history({}, function (err, messages) {
        assert.equal(null, err)
        assert.deepEqual({message: 'Hello onpush!'}, messages[0].value)
        assert.deepEqual({message: 'Hello push!'}, messages[1].value)
        done()
      })
    })
  })
}

module.exports = Push
