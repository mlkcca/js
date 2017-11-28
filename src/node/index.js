import MilkcocoaCore from '../core'
const packageJSON = require('../../package.json')

let dataset = {}
let store = {
  get (key) {
    return dataset[key]
  },

  set (key, data) {
    dataset[key] = data
  }
}

export default class extends MilkcocoaCore {
  constructor (options) {
    options.store = store
    super(options)
  }

  version () {
    return packageJSON.version
  }
}
