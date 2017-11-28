const Milkcocoa = require('../lib/node')
const config = require('./config')

const apiKey = 'IUvC0v9k7coq7b-LOBZgGkqmYcS1Sja4gTSDfG7a'

var milkcocoa = new Milkcocoa(Object.assign({}, config, {uuid: 'uuid1', apiKey: apiKey}))
milkcocoa.connect()
// console.log(milkcocoa.version());
console.log(milkcocoa.getAppId())
var ds = milkcocoa.dataStore('topic', {datatype: 'json'})

ds.on('push', function (e) {
  console.log(e)
})

milkcocoa.grant({}, function (err, accessToken) {
  console.log(err, accessToken.access_token)
  connect(accessToken.access_token)
})

function connect (accessToken) {
  var milkcocoa = new Milkcocoa(Object.assign({}, config, {uuid: 'uuid2', accessToken: accessToken}))
  milkcocoa.connect()
  var ds = milkcocoa.dataStore('topic', {datatype: 'json'})
  setInterval(function () {
    ds.push({message: 'Hello!'}, function (result) {
    // console.log(result);
    })
  }, 1000)
}
/*
setTimeout(function() {
  Milkcocoa.history({
    host: 'localhost',
    port: 8000,
    useSSL: false,
    appId: 'Bk9_7LVYg',
    apiKey: 'oVPtxGN_Od3AnF_8RzIiS3jW4q7ZNeYP01-skL4p',
    path: 'topic',
    uuid: 'uuid2'
  }, function(err, messages) {
    console.log(err, messages);
  });
}, 1000);
*/
