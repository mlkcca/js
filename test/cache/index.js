const assert = require('assert')
const Cache = require('../../lib/cache')

function CacheTest () {
  describe('query()', function () {
    let cache = new Cache()
    cache.add(100, [{id: '1', t: 70}, {id: '2', t: 60}])
    it('should get data when query ts is larger than data’s ts.', function () {
      assert.deepEqual([{id: '1', t: 70}, {id: '2', t: 60}], cache.query(100, 2))
    })
    it('should get only one data when the limit is 1.', function () {
      assert.deepEqual([{id: '1', t: 70}], cache.query(100, 1))
    })
    it('should get null when the query ts is smaller than data’s ts.', function () {
      assert.deepEqual(null, cache.query(50, 2))
    })
    it('should get null when the limit is larger than data’s length.', function () {
      assert.deepEqual(null, cache.query(100, 3))
    })
  })

  describe('add()', function () {
    let cache = new Cache()
    cache.add(1000, [{id: '1', t: 990}, {id: '2', t: 980}, {id: '8', t: 925}, {id: '4', t: 960}, {id: '5', t: 950}])
    cache.add(950, [{id: '6', t: 940}, {id: '7', t: 930}, {id: '3', t: 970}, {id: '9', t: 920}, {id: '10', t: 915}])
    it('should concat all data and sort by ts when it runs more than twice.', function () {
      assert.deepEqual([{id: '1', t: 990}, {id: '2', t: 980}, {id: '3', t: 970}, {id: '4', t: 960}, {id: '5', t: 950}, {id: '6', t: 940}, {id: '7', t: 930}, {id: '8', t: 925}, {id: '9', t: 920}, {id: '10', t: 915}], cache.query(1000, 10))
    })
  })
}

module.exports = CacheTest
