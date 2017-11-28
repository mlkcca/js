const assert = require('assert')
const Milkcocoa = require('../../lib/node')

function History (uuid) {
  const milkcocoa = new Milkcocoa({appId: 'demo', uuid: 'uuid-' + uuid + '-history', apiKey: 'demo'})
  var dataTime1 = 0
  var pushedDataTime1 = 0
  var dataTime2 = 0
  var pushedDataTime2 = 0

  describe('history()', function () {
    this.timeout(10000)

    before(function (done) {
      let ds = milkcocoa.dataStore(uuid + '/history')
      dataTime1 = new Date().getTime()
      setTimeout(function () {
        ds.push(1, function (err, result) {
          if (!err) pushedDataTime1 = result.timestamp
        })
      }, 1000)
      setTimeout(function () {
        dataTime2 = new Date().getTime()
        setTimeout(function () {
          ds.push(2, function (err, result) {
            if (!err) {
              pushedDataTime2 = result.timestamp
              if (dataTime1 * 1000 < pushedDataTime1 &&
                  pushedDataTime1 < dataTime2 * 1000 &&
                  dataTime2 * 1000 < pushedDataTime2) {
                done()
              }
            }
          })
        }, 1000)
      }, 2000)
    })

    it('should retrieve all data without options', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/history')
      ds.history({}, function (err, messages) {
        assert.equal(null, err)
        assert.equal(true, messages.length === 2)
        done()
      })
    })

    it('should retrieve the data before ts', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/history')
      ds.history({ts: dataTime2}, function (err, messages) {
        assert.equal(null, err)
        assert.equal(true, messages.length === 1)
        assert.equal(true, messages[0].timestamp < dataTime2)
        done()
      })
    })

    it('should retrieve a data when limit === 1', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/history')
      ds.history({limit: 1}, function (err, messages) {
        assert.equal(null, err)
        assert.equal(true, messages.length === 1)
        done()
      })
    })

    it('should retrieve the latest data when order === "desc" && limit === 1', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/history')
      ds.history({order: 'desc', limit: 1}, function (err, messages) {
        assert.equal(null, err)
        assert.equal(true, messages.length === 1)
        assert.equal(true, messages[0].timestamp > dataTime2)
        done()
      })
    })

    it('should retrieve the oldest data when order === "asc" && limit === 1', function (done) {
      let ds = milkcocoa.dataStore(uuid + '/history')
      ds.history({order: 'asc', limit: 1}, function (err, messages) {
        assert.equal(null, err)
        assert.equal(true, messages.length === 1)
        assert.equal(true, messages[0].timestamp < dataTime2)
        done()
      })
    })
  })
}

module.exports = History
