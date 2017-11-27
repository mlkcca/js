const assert = require('assert')
const Cache = require('../../lib/cache')

describe('cache', function () {
  it('query1', function () {
    let cache = new Cache()
    cache.add(100, [{id: '1', t: 70}, {id: '2', t: 60}])
    assert.deepEqual([{id: '1', t: 70}], cache.query(100, 1))
  })

  it('query2', function () {
    let cache = new Cache()
    cache.add(1000, [{id: '1', t: 990}, {id: '2', t: 980}, {id: '3', t: 970}, {id: '4', t: 960}, {id: '5', t: 950}])
    cache.add(950, [{id: '6', t: 940}, {id: '7', t: 930}])
    assert.deepEqual(null,
    cache.query(980, 10))
  })

  it('query3', function () {
    let cache = new Cache()
    cache.add(1000, [{id: '1', t: 990}, {id: '2', t: 980}, {id: '3', t: 970}, {id: '4', t: 960}, {id: '5', t: 950}])
    cache.add(950, [{id: '6', t: 940}, {id: '7', t: 930}, {id: '8', t: 925}, {id: '9', t: 920}, {id: '10', t: 915}])
    assert.deepEqual([{id: '2', t: 980}, {id: '3', t: 970}, {id: '4', t: 960}, {id: '5', t: 950}, {id: '6', t: 940}, {id: '7', t: 930}],
    cache.query(980, 6))
  })
})
