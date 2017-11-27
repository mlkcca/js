const history = require('./history')
const push = require('./push')
const uuidv4 = require('uuid/v4')

describe('DataStore', function () {
  const uuid = uuidv4()
  describe('Push', function () {
    push(uuid)
  })
  // history()
})
