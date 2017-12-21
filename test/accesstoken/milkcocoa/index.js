const axios = require('axios')
const assert = require('assert')
const Milkcocoa = require('../../../lib/node')
const uuidv4 = require('uuid/v4')
const settings = require('../../../settings')[process.env.NODE_ENV || 'production']

function MilkcocoaTest (uuid) {
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
        settings.jsOptions.uuid = 'uuid-' + uuid + '-milkcocoa-accesstoken'
        milkcocoa = new Milkcocoa(settings.jsOptions)
        done()
      })
      .catch(function (error) {
        throw error
      })
    })
    describe('getAppId()', function () {
      it('should get appId "demo".', function () {
        assert.equal(settings.appId, milkcocoa.getAppId())
      })
    })
    describe('getUUID()', function () {
      it('should get current uuid.', function () {
        assert.equal('uuid-' + uuid + '-milkcocoa-accesstoken', milkcocoa.getUUID())
      })
    })
    describe('listDataStores()', function () {
      before(function (done) {
        let ds = milkcocoa.dataStore(uuid + '/accessToken/listDataStores')
        ds.push(1)
        setTimeout(function () {
          done()
        }, 1000)
      })
      it('should get a dataStore list.', function (done) {
        milkcocoa.listDataStores({}, function (err, dss) {
          if (err) done()
          assert.equal(true, dss.length > 0)
          done()
        })
      })
      it('should get the specific dataStore.', function (done) {
        milkcocoa.listDataStores({c: uuid}, function (err, dss) {
          if (err) done()
          assert.equal(true, dss.length > 0)
          done()
        })
      })
    })
    describe('grant()', function () {
      it('should generate an access token.', function (done) {
        milkcocoa.grant({}, function (err, accessToken) {
          if (err) done()
          assert.equal('string', typeof accessToken.access_token)
          assert.equal('number', typeof accessToken.ttl)
          assert.equal('object', typeof accessToken.rules)
          done()
        })
      })
    })
  })
}

MilkcocoaTest(global.uuid || uuidv4())

module.exports = MilkcocoaTest
