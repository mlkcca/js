const Milkcocoa = require('../lib/node')
const config = require('./config')

start('1')

function start (prefix) {
  var milkcocoa = new Milkcocoa(Object.assign({}, config, {uuid: prefix + 'uuid1'}))

  var ds = []
  ds[0] = milkcocoa.dataStore('remote-bench1-1', {datatype: 'json'})
  ds[1] = milkcocoa.dataStore('remote-bench1-2', {datatype: 'json'})
  ds[2] = milkcocoa.dataStore('remote-bench1-3', {datatype: 'json'})
  ds[3] = milkcocoa.dataStore('remote-bench1-4', {datatype: 'json'})
  ds[4] = milkcocoa.dataStore('remote-bench1-5', {datatype: 'json'})
  ds[5] = milkcocoa.dataStore('remote-bench1-6', {datatype: 'json'})
  ds[6] = milkcocoa.dataStore('remote-bench1-7', {datatype: 'json'})
  ds[7] = milkcocoa.dataStore('remote-bench1-8', {datatype: 'json'})
  ds[8] = milkcocoa.dataStore('remote-bench1-9', {datatype: 'json'})
  ds[9] = milkcocoa.dataStore('remote-bench1-10', {datatype: 'json'})

  // var ds = milkcocoa.dataStore('aaa', {datatype: 'json'});
  // var aaa_ds = milkcocoa.dataStore('remote-bench1-1', {datatype: 'json'});

  for (var i = 0; i < 10; i++) {
    ds[i].on('push', subscribe('topic' + i))
  }

  function subscribe (i) {
    return function (e) {
    // if(i == 'topic8')
      console.log(i, new Date(e.timestamp / 1000).toLocaleString(), e.timestamp, e.value.count)
    }
  }

/*
ds.on('set', function(e) {
  console.log(e);
});
aaa_ds.on('push', function(e) {
  console.log(e);
});
*/
/*
ds.push({message: "Hello!"}, function(result) {
  console.log(result);
});
*/
}
