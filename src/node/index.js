import MilkcocoaCore from '../core';
const WebSocket = require('ws');


let dataset = {};
let store = {
  get(key) {
  	return dataset[key];
  },

  set(key, data) {
  	dataset[key] = data;
  }
};

export default class extends MilkcocoaCore {
	constructor(options) {
		options.store = store;
		options.WebSocket = WebSocket;
		super(options);
	}

	version() {
		return packageJSON.version;
	}
}