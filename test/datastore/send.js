const assert = require('assert')
const Milkcocoa = require('../../lib/node')

function Send (uuid) {
  const milkcocoa = new Milkcocoa({appId: 'demo', uuid: 'uuid-' + uuid, apiKey: 'demo'})

  describe('send()', function () {
    it('should call the onCompleteCallback whose err is null.', function (done) {
      let ds = milkcocoa.dataStore(uuid, {datatype: 'json'})
      ds.send({message: 'Hello send!'}, function (err) {
        if (err) done()
        assert.equal(null, err)
        done()
      })
    })
  })

  describe('on(send)', function () {
    this.timeout(3000)
    it('should be called by send() and have the sent data.', function (done) {
      let ds = milkcocoa.dataStore(uuid, {datatype: 'json'})
      ds.on('send', function (payload) {
        assert.deepEqual({message: 'Hello onsend!'}, payload.value)
        done()
      })
      ds.send({message: 'Hello onsend!'})
    })
  })
}

module.exports = Send
