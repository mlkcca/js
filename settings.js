module.exports = {
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
