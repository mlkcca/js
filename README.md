# mlkcca-js


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

```
Milkcocoa.history({
	appId: 'app id',
	path: 'aaa'
}, function() {
	
})
```