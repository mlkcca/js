// require('dotenv').config('.env')
const $ = require('jquery')
const Milkcocoa = require('../src/web')
const uuidv4 = require('uuid/v4')

const settingsSrc = {
  development: {
    endpoint: 'http://localhost:8000',
    mqttEndpoint: 'localhost',
    websocketEndpoint: 'ws://localhost:8000',
    appId: process.env.APP_ID,
    apiKey: process.env.API_KEY,
    jsOptions: {
      host: 'localhost',
      appId: process.env.APP_ID,
      apiKey: process.env.API_KEY,
      useSSL: false,
      port: 8000
    }
  },
  staging: {
    endpoint: 'https://stg-pubsub1.mlkcca.com',
    mqttEndpoint: 'stg-pubsub1.mlkcca.com',
    websocketEndpoint: 'wss://stg-pubsub1.mlkcca.com',
    appId: process.env.APP_ID,
    apiKey: process.env.API_KEY,
    jsOptions: {
      host: 'stg-pubsub1.mlkcca.com',
      appId: process.env.APP_ID,
      apiKey: process.env.API_KEY
    }
  },
  production: {
    endpoint: 'https://pubsub1.mlkcca.com',
    mqttEndpoint: 'pubsub1.mlkcca.com',
    websocketEndpoint: 'wss://pubsub1.mlkcca.com',
    appId: 'demo',
    apiKey: 'demo',
    jsOptions: {
      appId: 'demo',
      apiKey: 'demo'
    }
  },
  test: {
    endpoint: 'https://pubsub1.mlkcca.com',
    mqttEndpoint: 'pubsub1.mlkcca.com',
    websocketEndpoint: 'wss://pubsub1.mlkcca.com',
    appId: 'demo',
    apiKey: 'demo',
    jsOptions: {
      appId: 'demo',
      apiKey: 'demo'
    }
  }
}

const settings = settingsSrc[process.env.NODE_ENV || 'production']

$(function () {
  $.ajax({
    url: settings.endpoint + '/api/grant/' + process.env.APP_ID + '/' + process.env.API_KEY,
    type: 'GET'
  })
  .done(function (data) {
    const milkcocoa = new Milkcocoa({
      host: 'localhost',
      appId: process.env.APP_ID,
      // apiKey: process.env.API_KEY,
      accessToken: data.content.access_token,
      useSSL: false,
      port: 8000
    })
    const ds = milkcocoa.dataStore('browser-test/' + uuidv4())
    ds.on('push', function (mes) { console.log(mes) })
    setInterval(function () {
      ds.push(1, function (err, result) {
        console.log(err, result)
      })
    }, 3000)
  })
  .fail(function () {
  })
})
