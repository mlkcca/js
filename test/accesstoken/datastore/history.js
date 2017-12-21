const axios = require('axios')
const assert = require('assert')
const Milkcocoa = require('../../../lib/node')
const uuidv4 = require('uuid/v4')
const settings = require('../../../settings')[process.env.NODE_ENV || 'production']

function History (uuid) {
  const grantURL = settings.endpoint + '/api/grant/' + settings.appId + '/' + settings.apiKey
  var milkcocoa
  var median = 0

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

    describe('history()', function () {
      this.timeout(10000)

      before(function (done) {
        let ds = milkcocoa.dataStore(uuid + '/accessToken/history')
        setTimeout(function () {
          ds.push(1, function (err, result) {
            if (err) throw err
          })
        }, 1000)
        setTimeout(function () {
          ds.push(2, function (err, result) {
            if (!err) done()
          })
        }, 2000)
      })

      it('should retrieve all data without options', function (done) {
        let ds = milkcocoa.dataStore(uuid + '/accessToken/history')
        ds.history({}, function (err, messages) {
          assert.equal(null, err)
          median = Math.floor((messages[0].timestamp + messages[1].timestamp) / 2)
          assert.equal(true, messages.length === 2)
          done()
        })
      })

      it('should retrieve the data before ts', function (done) {
        let ds = milkcocoa.dataStore(uuid + '/accessToken/history')
        ds.history({ts: median}, function (err, messages) {
          assert.equal(null, err)
          assert.equal(true, messages.length === 1)
          assert.equal(true, messages[0].timestamp < median)
          done()
        })
      })

      it('should retrieve a data when limit === 1', function (done) {
        let ds = milkcocoa.dataStore(uuid + '/accessToken/history')
        ds.history({limit: 1}, function (err, messages) {
          assert.equal(null, err)
          assert.equal(true, messages.length === 1)
          done()
        })
      })

      it('should retrieve the latest data when order === "desc" && limit === 1', function (done) {
        let ds = milkcocoa.dataStore(uuid + '/accessToken/history')
        ds.history({order: 'desc', limit: 1}, function (err, messages) {
          assert.equal(null, err)
          assert.equal(true, messages.length === 1)
          assert.equal(true, messages[0].timestamp > median)
          done()
        })
      })

      it('should retrieve the oldest data when order === "asc" && limit === 1', function (done) {
        let ds = milkcocoa.dataStore(uuid + '/accessToken/history')
        ds.history({order: 'asc', limit: 1}, function (err, messages) {
          assert.equal(null, err)
          assert.equal(true, messages.length === 1)
          assert.equal(true, messages[0].timestamp < median)
          done()
        })
      })
    })
  })
}

History(global.uuid || uuidv4())

module.exports = History
