const axios = require('axios')
const assert = require('assert')
const Milkcocoa = require('../../../lib/node')
const uuidv4 = require('uuid/v4')
const settings = require('../../../settings')[process.env.NODE_ENV || 'production']

function Send (uuid) {
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

    describe('send()', function () {
      it('should call the onCompleteCallback whose err is null.', function (done) {
        let ds = milkcocoa.dataStore(uuid + '/accessToken/send')
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
        let ds = milkcocoa.dataStore(uuid + '/accessToken/send')
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
  })
}

Send(global.uuid || uuidv4())

module.exports = Send
