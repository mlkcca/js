const datatype = require('./datatype')
const push = require('./push')
const send = require('./send')
const set = require('./set')
const onoff = require('./onoff')
const history = require('./history')

function DataStore (uuid) {
  describe('DataType', function () {
    datatype(uuid)
  })
  describe('Push', function () {
    push(uuid)
  })
  describe('Send', function () {
    send(uuid)
  })
  describe('Set', function () {
    set(uuid)
  })
  describe('On/Off', function () {
    onoff(uuid)
  })
  describe('History', function () {
    history(uuid)
  })
}

module.exports = DataStore
