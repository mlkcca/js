import Span from './span'

// desc cache
export default class {
  constructor (options) {
    this.spanList = []
  }

  add (ts, data) {
    let span = new Span(ts, data)
    this.spanList.push(span)
    this._combine()
  }

  _combine () {
    this.spanList = this.spanList.reduce((acc, s) => {
      if (acc.length === 0) {
        return [s]
      } else {
        if (acc[0].combine(s)) {
          return acc
        } else {
          return acc.concat([s])
        }
      }
    }, [])
  }

  query (ts, limit) {
    for (var i = 0; i < this.spanList.length; i++) {
      let s = this.spanList[i]
      let data = s.query(ts, limit)
      if (data !== null) {
        return data
      }
    }
    return null
  }
}
