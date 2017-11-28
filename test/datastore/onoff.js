const assert = require('assert')
const Milkcocoa = require('../../lib/node')

function OnOff (uuid) {
  const milkcocoa = new Milkcocoa({appId: 'demo', uuid: 'uuid-' + uuid, apiKey: 'demo'})

  describe('on()', function () {
    this.timeout(3000)
    it('should be called by publishing.', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/on')
      ds.on('send', function (payload) {
        done()
      })
      setTimeout(function () {
        ds.send(1)
      }, 100)
    })
  })

  describe('off()', function () {
    this.timeout(5000)
    it('should cancel all on().', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/off')
      ds.on('send', function (payload) {
        assert.fail(1)
        done()
      })
      ds.on('send', function (payload) {
        assert.fail(2)
        done()
      })
      ds.on('send', function (payload) {
        assert.fail(3)
        done()
      })
      ds.on('push', function (payload) {
        assert.fail(4)
        done()
      })
      setTimeout(function () {
        ds.off('send')
        ds.off('push')
        setTimeout(function () {
          ds.send(1)
          ds.push(1)
          setTimeout(function () {
            done()
          }, 2000)
        }, 100)
      }, 100)
    })
  })
}

module.exports = OnOff
