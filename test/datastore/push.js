const assert = require('assert')
const Milkcocoa = require('../../lib/node')
const uuidv4 = require('uuid/v4')

function Push (uuid) {
  const milkcocoa = new Milkcocoa({appId: 'demo', uuid: 'uuid-' + uuid + '-push', apiKey: 'demo'})

  describe('push()', function () {
    it('should call the onCompleteCallback whose argument is the same data.', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/push')
      ds.push({message: 'Hello push!'}, function (err, result) {
        if (err) done()
        assert.equal(null, err)
        assert.deepEqual({message: 'Hello push!'}, result.value)
        assert.equal('number', typeof result.timestamp)
        assert.equal('string', typeof result.id)
        done()
      })
    })
  })

  describe('on(push)', function () {
    this.timeout(3000)
    it('should be called by push() and have the pushed data.', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/push')
      ds.on('push', function (payload) {
        assert.deepEqual({message: 'Hello onpush!'}, payload.value)
        assert.equal('number', typeof payload.timestamp)
        assert.equal('string', typeof payload.id)
        done()
      })
      setTimeout(function () {
        ds.push({message: 'Hello onpush!'})
      }, 100)
    })
  })

  describe('history()', function () {
    this.timeout(3000)
    it('should retrieve pushed data.', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/push')
      ds.history({}, function (err, messages) {
        assert.equal(null, err)
        assert.deepEqual({message: 'Hello onpush!'}, messages[0].value)
        assert.deepEqual({message: 'Hello push!'}, messages[1].value)
        assert.equal('number', typeof messages[0].timestamp)
        assert.equal('string', typeof messages[0].id)
        done()
      })
    })
  })
}

Push(global.uuid || uuidv4())

module.exports = Push
