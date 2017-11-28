const uuidv4 = require('uuid/v4')

const datatype = require('./datatype')
const push = require('./push')
const send = require('./send')
const set = require('./set')
const onoff = require('./onoff')
const history = require('./history')

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
  describe('History', function () {
    history(uuid)
  })
})
