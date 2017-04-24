# mlkcca-js


[![CircleCI](https://circleci.com/gh/mlkcca/js.svg?style=svg)](https://circleci.com/gh/mlkcca/js)


please see [here](https://github.com/mlkcca/js/tree/master/test).


- dist/milkcocoa.js is for browser
- lib/node/index.js is entry of Node.JS library

## Getting Started

```
var milkcocoa = new Milkcocoa({
	appId: 'your app id',
	apiKey: 'your API key'
});

var ds = milkcocoa.dataStore('aaa');

ds.on('push', function(message) {
	console.log(message)
});

ds.push({message: 'Hello'});
```

## Reference

### list datastores

```
//'d' is prefix of datastore name
milkcocoa.listDataStores({c:'d'}, function(err, result) {
	console.log(err, result);
});
```

### grant

```
milkcocoa.grant({}, function(err, result) {
	if(err) {
		console.error(err);
		return;
	}
	//accessToken
	console.log(result.access_token);
	connectWithAccessToken(result.access_token);
})

function connectWithAccessToken(accessToken) {
	var milkcocoa = new Milkcocoa({
		appId: config.appId,
		accessToken: accessToken
	});
	// milkcocoa is authenticated by accessToken
}
```