const assert = require('assert')
const Milkcocoa = require('../../lib/node')
const uuidv4 = require('uuid/v4')
const settings = require('../../settings')[process.env.NODE_ENV || 'production']

function DataType (uuid) {
  const milkcocoa = new Milkcocoa(settings.jsOptions)

  describe('dataStore(*, {datatype: "json"})', function () {
    it('should receive push() callback data as object.', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/datatype/json/push/callback', {datatype: 'json'})
      ds.push(1, function (err, result) {
        if (err) done()
        assert.equal('object', typeof result)
        assert.equal('number', typeof result.value)
        done()
      })
    })
    it('should receive on(push) callback data as object.', function (done) {
      this.timeout(5000)
      let ds = milkcocoa.dataStore(uuid + '/datatype/json/push/on', {datatype: 'json'})
      ds.on('push', function (payload) {
        assert.equal('object', typeof payload)
        assert.equal('number', typeof payload.value)
        done()
      })
      setTimeout(function () {
        ds.push(2)
      }, 1000)
    })
    it('should receive on(send) callback data as object.', function (done) {
      this.timeout(5000)
      let ds = milkcocoa.dataStore(uuid + '/datatype/json/send/on', {datatype: 'json'})
      ds.on('send', function (payload) {
        assert.equal('object', typeof payload)
        assert.equal('number', typeof payload.value)
        done()
      })
      setTimeout(function () {
        ds.send(3)
      }, 1000)
    })
    it('should receive on(set) callback data as object.', function (done) {
      this.timeout(5000)
      let ds = milkcocoa.dataStore(uuid + '/datatype/json/set/on', {datatype: 'json'})
      ds.on('set', function (payload) {
        assert.equal('object', typeof payload)
        assert.equal('number', typeof payload.value)
        done()
      })
      setTimeout(function () {
        ds.set('datatype-set-on', 4)
      }, 1000)
    })
    it('should retrieve pushed data as object.', function (done) {
      this.timeout(5000)
      let ds = milkcocoa.dataStore(uuid + '/datatype/json/push/callback', {datatype: 'json'})
      ds.history({}, function (err, messages) {
        if (err) done()
        assert.equal('object', typeof messages[0])
        assert.equal('number', typeof messages[0].value)
        done()
      })
    })
    it('should retrieve set data as object.', function (done) {
      this.timeout(5000)
      let ds = milkcocoa.dataStore(uuid + '/datatype/json/set/on', {datatype: 'json'})
      ds.history({}, function (err, messages) {
        if (err) done()
        assert.equal('object', typeof messages[0])
        assert.equal('number', typeof messages[0].value)
        done()
      })
    })
  })
}

DataType(global.uuid || uuidv4())

module.exports = DataType
