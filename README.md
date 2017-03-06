# mlkcca-js


[![CircleCI](https://circleci.com/gh/mlkcca/js.svg?style=svg)](https://circleci.com/gh/mlkcca/js)


please see [here](https://github.com/mlkcca/js/tree/master/test).



```
var milkcocoa = new Milkcocoa({
	appId: 'your app id',
	apiKey: 'your API key'
});

var ds = milkcocoa.dataStore('aaa');

ds.on('push', function() {
	
});

ds.push({});

```

- dist/milkcocoa.js is for browser
- lib/node/index.js is entry of Node.JS library