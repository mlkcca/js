const axios = require('axios')
const assert = require('assert')
const Milkcocoa = require('../../../lib/node')
const uuidv4 = require('uuid/v4')
const settings = require('../../../settings')[process.env.NODE_ENV || 'production']

function OnOff (uuid) {
  const grantURL = settings.endpoint + '/api/grant/' + settings.appId + '/' + settings.apiKey
  var milkcocoa

  describe('with access token', function () {
    before(function (done) {
      axios({
        method: 'get',
        url: grantURL
      })
      .then(function (res) {
        var accessToken = res.data.content.access_token
        delete settings.jsOptions.apiKey
        settings.jsOptions.accessToken = accessToken
        milkcocoa = new Milkcocoa(settings.jsOptions)
        done()
      })
      .catch(function (error) {
        throw error
      })
    })

    describe('on()', function () {
      this.timeout(5000)
      it('should be called by publishing.', function (done) {
        let ds = milkcocoa.dataStore(uuid + '/accessToken/on')
        ds.on('send', function (payload) {
          assert.ok(true)
          done()
        })
        setTimeout(function () {
          ds.send(1)
        }, 1000)
      })
    })

    describe('off()', function () {
      this.timeout(5000)
      it('should cancel all on().', function (done) {
        let ds = milkcocoa.dataStore(uuid + '/accessToken/off')
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
              assert.ok(true)
              done()
            }, 2000)
          }, 500)
        }, 500)
      })
    })
  })
}

OnOff(global.uuid || uuidv4())

module.exports = OnOff
