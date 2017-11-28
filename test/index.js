const uuidv4 = require('uuid/v4')

const cache = require('./cache')
const datastore = require('./datastore')
const milkcocoa = require('./milkcocoa')

const uuid = uuidv4()

describe('Cache', function () {
  cache()
})

describe('DataStore', function () {
  datastore(uuid)
})

describe('Milkcocoa', function () {
  milkcocoa(uuid)
})
