const history = require('./history')
const push = require('./push')
const send = require('./send')
const set = require('./set')
const onoff = require('./onoff')
const datatype = require('./datatype')
const uuidv4 = require('uuid/v4')

describe('DataStore', function () {
  const uuid = uuidv4()
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
  // history()
})
