export default class {
  static decode (message, type) {
    if (type === 'json') return this.json(message)
    else if (type === 'text') return this.text(message)
    else if (type === 'binary') return this.binary(message)
    else return this.text(message)
  }

  static json (message) {
    if (!message) return null
    let value = null
    if (typeof message.v === 'string') {
      try {
        value = JSON.parse(message.v)
      } catch (e) {
        value = message.v
      }
    } else {
      value = message.v
    }
    return {
      id: message.id,
      timestamp: Math.floor(message.t),
      value: value
    }
  }

  static text (message) {
    return message
  }

  static binary (message) {
    // TODO
    return message
  }
}
