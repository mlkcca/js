import MilkcocoaCore from '../core';
import {authWithMilkcocoa} from './auth';

let store = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },

  set(key, data) {
    try {
      return localStorage.setItem(key, data);
    } catch (e) {
      return null;
    }
  }
};

export default class Milkcocoa extends MilkcocoaCore {
	constructor(options) {
		options.store = store;
		super(options);
	}

	version() {
		return packageJSON.version;
	}

	static authWithMilkcocoa(options, callback) {
		authWithMilkcocoa(Object.assign({}, options.authOptions, {appId: options.appId, callback: function(accessToken) {
			console.log(accessToken);
			callback(null, new Milkcocoa(Object.assign({}, options, {accessToken:accessToken})));
		}}))
	}
}