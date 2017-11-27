const assert = require('assert')
const Milkcocoa = require('../lib/node')

var milkcocoa = new Milkcocoa({appId: 'demo', uuid: 'uuid1', apiKey: 'demo'})

describe('milkcocoa', function () {
  it('getAppId', function () {
    assert.equal('demo', milkcocoa.getAppId())
  })
})
