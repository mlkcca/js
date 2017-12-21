import querystring from 'querystring'
import genUUID from 'uuid'
import packageJSON from '../../package.json'
import Pubsub from './pubsub'
import Remote from './remote'
import DataStore from './datastore'

export default class {
  constructor (options) {
    this.options = options
    this.appId = options.appId
    this.store = options.store
    if (!this.appId) throw new Error('appId required')
    if (!this.store) throw new Error('store required')
    this.uuid = this.getUUID(options.uuid)
    this.apiKey = options.apiKey
    this.accessToken = options.accessToken
    this.useSSL = options.hasOwnProperty('useSSL') ? options.useSSL : true
    this.host = options.host || 'pubsub1.mlkcca.com'
    this.port = options.port || 443
    this.keepaliveTimeout = options.keepaliveTimeout || 300
    let headers = {}
    if (this.accessToken) headers['Authorization'] = 'Bearer ' + this.accessToken
    this.remote = new Remote(this.host, this.port, this.useSSL, headers)
    this.wsOptions = {
      headers: headers
    }
    // websocket is unused
    this.websocket = new Pubsub({
      host: this._getPubsubUrl(this.useSSL, this.host, this.port, this.appId, this.apiKey, this.accessToken, this.uuid),
      logger: console,
      WebSocket: this.options.WebSocket,
      wsOptions: this.wsOptions,
      keepalive: options.keepalive || 36
    }, this)
    this.connect()
  }

  version () {
    return packageJSON.version
  }

  getAppId () {
    return this.appId
  }

  getUUID (uuid) {
    if (uuid) {
      this.store.set('uuid', uuid)
    } else {
      let currentUUID = this.store.get('uuid', uuid)
      if (currentUUID) {
        uuid = currentUUID
      } else {
        uuid = genUUID()
        this.store.set('uuid', uuid)
      }
    }
    return uuid
  }

  connect () {
    this.websocket.connect()
  }

  disconnect () {
    this.websocket.disconnect()
  }

  on (event, fn) {
    this.websocket.on(event, fn)
  }

  // unused
  _getPubsubUrl (ssl, host, port, appId, apikey, accessToken, uuid) {
    let base = `ws${ssl ? 's' : ''}://${host}:${port}/ws2/${appId}/`
    if (apikey) return base + apikey + '?' + querystring.stringify({uuid: uuid})
    else return base + '?' + querystring.stringify({uuid: uuid})
  }

  _getApiUrl (api) {
    let appOptions = this._getOptions()
    if (appOptions.apiKey) return `/api/${api}/${appOptions.appId}/${appOptions.apiKey}`
    else return `/api/${api}/${appOptions.appId}`
  }

  _getOnUrl (api) {
    let appOptions = this._getOptions()
    if (appOptions.apiKey) return `/on/${api}/${appOptions.appId}/${appOptions.apiKey}`
    else return `/on/${api}/${appOptions.appId}`
  }

  _getPubsub () {
    return this.websocket
  }

  _getRemote () {
    return this.remote
  }

  _getOptions () {
    return this.options
  }

  dataStore (path, options) {
    return new DataStore(this, path, options)
  }

  grant (options, cb) {
    let apiUrl = this._getApiUrl('grant')
    let params = options
    this.remote.get(apiUrl, params).then(function (result) {
      if (result.err) {
        cb(result.err)
        return
      }
      cb(null, result.content)
    }).catch(function (err) {
      cb(err)
    })
  }

  listDataStores (options, cb) {
    let apiUrl = this._getApiUrl('ds')
    let params = {
      c: options.c || ''
    }
    params.limit = options.limit || 100
    this._getRemote().get(apiUrl, params).then((result) => {
      if (result.err) {
        cb(result.err)
      } else {
        let dataStores = result.content
        cb(null, dataStores)
      }
    }).catch(function (err) {
      cb(err)
    })
  }

  static history (options, cb) {
    let appId = options.appId
    let apiKey = options.apiKey
    let useSSL = options.hasOwnProperty('useSSL') ? options.useSSL : true
    let host = options.host || 'pubsub1.mlkcca.com'
    let port = options.port || 443
    var remote = new Remote(host, port, useSSL, {})
    remote.get(`/api/history/${appId}/${apiKey}`, {c: options.path}).then(function (messages) {
      cb(null, messages)
    }).catch(function (err) {
      cb(err)
    })
  }

  static grant () {

  }
}
