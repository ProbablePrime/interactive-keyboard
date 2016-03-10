function Config(file) {
	this.beam = {
		username: '',
		password: '',
		channel: '',
		channelId: 0
	};
	this.blocks = {};
	this.remap = false;
	this.remapTable = {};
	this.tactileThreshold = 0.5;
	this.handler = 'robotjs';
	this.version = '';
	this.shareCode = '';
	this.widgets = true;

	this.consensus = 'democracy';
	this.joyStickConsensus = 'democracy';

	if (file) {
		file = file.replace('\\', '/');
	} else {
		console.warn('using default config file');
		file = './config/default.json';
	}

	var config;
	try {
		// Load the config values in from the json
		config = require('.' + file);
		Object.assign(this, config);
	} catch (e) {
		console.log(e);
		if (e.code === 'MODULE_NOT_FOUND') {
			throw new Error('Cannot find ' + file);
		} else {
			throw new Error('Your config file is incorrectly formatted, please check it at jsonlint.com');
		}
	}
	var authConfig;
	try {
		authConfig = require('../config/auth.json');
		if (authConfig) {
			Object.assign(this.beam, authConfig);
		}
	} catch (e) {
		console.warn('Please move your authenication data to auth.json.');
	}
}

module.exports = Config;
