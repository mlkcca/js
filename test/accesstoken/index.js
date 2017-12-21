const uuidv4 = require('uuid/v4')
global.uuid = global.uuid || uuidv4()

function AccessToken () {
  describe('DataStore', function () {
    require('./datastore')
  })

  describe('Milkcocoa', function () {
    require('./milkcocoa')
  })
}

AccessToken()

module.exports = AccessToken
