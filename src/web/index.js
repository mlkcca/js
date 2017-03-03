import MilkcocoaCore from '../core';


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

export default class extends MilkcocoaCore {
	constructor(options) {
		options.store = store;
		super(options);
	}

	version() {
		return packageJSON.version;
	}
}