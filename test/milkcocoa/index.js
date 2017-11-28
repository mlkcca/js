const assert = require('assert')
const Milkcocoa = require('../../lib/node')

function MilkcocoaTest (uuid) {
  const milkcocoa = new Milkcocoa({appId: 'demo', uuid: 'uuid-' + uuid + '-milkcocoa', apiKey: 'demo'})

  describe('getAppId()', function () {
    it('should get appId "demo".', function () {
      assert.equal('demo', milkcocoa.getAppId())
    })
  })
  describe('get_uuid()', function () {
    it('should get current uuid.', function () {
      assert.equal('uuid-' + uuid + '-milkcocoa', milkcocoa.get_uuid())
    })
  })
  describe('listDataStores()', function () {
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
}

module.exports = MilkcocoaTest
