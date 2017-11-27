const history = require('./history')
const push = require('./push')
const send = require('./send')
const set = require('./set')
const onoff = require('./onoff')
const uuidv4 = require('uuid/v4')

describe('DataStore', function () {
  const uuid = uuidv4()
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
