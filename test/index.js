const uuidv4 = require('uuid/v4')
global.uuid = uuidv4()

console.log('Milkcocoa JS SKD Tests, uuid: ' + global.uuid + '.\n')

describe('Cache', function () {
  require('./cache')
})

describe('DataStore', function () {
  require('./datastore')
})

describe('Milkcocoa', function () {
  require('./milkcocoa')
})

describe('AccessToken', function () {
  require('./accesstoken')
})
