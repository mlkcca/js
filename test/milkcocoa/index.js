const assert = require('assert')
const Milkcocoa = require('../../lib/node')
const uuidv4 = require('uuid/v4')
const settings = require('../../settings')[process.env.NODE_ENV || 'production']

function MilkcocoaTest (uuid) {
  settings.jsOptions.uuid = 'uuid-' + uuid + '-milkcocoa'
  const milkcocoa = new Milkcocoa(settings.jsOptions)

  describe('getAppId()', function () {
    it('should get current appId.', function () {
      assert.equal(settings.jsOptions.appId, milkcocoa.getAppId())
    })
  })
  describe('getUUID()', function () {
    it('should get current uuid.', function () {
      assert.equal('uuid-' + uuid + '-milkcocoa', milkcocoa.getUUID())
    })
  })
  describe('listDataStores()', function () {
    before(function (done) {
      let ds = milkcocoa.dataStore(uuid + '/listDataStores')
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
}

MilkcocoaTest(global.uuid || uuidv4())

module.exports = MilkcocoaTest
