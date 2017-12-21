const assert = require('assert')
const Milkcocoa = require('../../lib/node')
const uuidv4 = require('uuid/v4')
const settings = require('../../settings')[process.env.NODE_ENV || 'production']

function Send (uuid) {
  const milkcocoa = new Milkcocoa(settings.jsOptions)

  describe('send()', function () {
    it('should call the onCompleteCallback whose err is null.', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/send')
      ds.send({message: 'Hello send!'}, function (err) {
        if (err) done()
        assert.equal(null, err)
        done()
      })
    })
  })

  describe('on(send)', function () {
    this.timeout(5000)
    it('should be called by send() and have the sent data.', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/send')
      ds.on('send', function (payload) {
        assert.deepEqual({message: 'Hello onsend!'}, payload.value)
        assert.equal('number', typeof payload.timestamp)
        done()
      })
      setTimeout(function () {
        ds.send({message: 'Hello onsend!'})
      }, 1000)
    })
  })
}

Send(global.uuid || uuidv4())

module.exports = Send
