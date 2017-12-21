const axios = require('axios')
const assert = require('assert')
const Milkcocoa = require('../../../lib/node')
const uuidv4 = require('uuid/v4')
const settings = require('../../../settings')[process.env.NODE_ENV || 'production']

function Push (uuid) {
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

    describe('push()', function () {
      it('should call the onCompleteCallback whose argument is the same data.', function (done) {
        let ds = milkcocoa.dataStore(uuid + '/accessToken/push')
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
      this.timeout(5000)
      it('should be called by push() and have the pushed data.', function (done) {
        let ds = milkcocoa.dataStore(uuid + '/accessToken/push')
        ds.on('push', function (payload) {
          assert.deepEqual({message: 'Hello onpush!'}, payload.value)
          assert.equal('number', typeof payload.timestamp)
          assert.equal('string', typeof payload.id)
          done()
        })
        setTimeout(function () {
          ds.push({message: 'Hello onpush!'})
        }, 1000)
      })
    })

    describe('history()', function () {
      this.timeout(3000)
      it('should retrieve pushed data.', function (done) {
        let ds = milkcocoa.dataStore(uuid + '/accessToken/push')
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
  })
}

Push(global.uuid || uuidv4())

module.exports = Push
