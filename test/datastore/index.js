const uuidv4 = require('uuid/v4')
global.uuid = global.uuid || uuidv4()

function DataStore () {
  describe('DataType', function () {
    require('./datatype')
  })
  describe('Push', function () {
    require('./push')
  })
  describe('Send', function () {
    require('./send')
  })
  describe('Set', function () {
    require('./set')
  })
  describe('On/Off', function () {
    require('./onoff')
  })
  describe('History', function () {
    require('./history')
  })
}

DataStore()

module.exports = DataStore
