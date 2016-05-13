'use strict';
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
	this.windowBorder = {
		x: {
			max: 0,
			min: 0
		},
		y: {
			max: 0,
			min: 0
		}
	};

	this.consensus = 'democracy';
	this.joyStickConsensus = 'democracy';
	this.mouseEnabled = false;
	this.windowTarget = '';

	this.mouseSource = 'joystick';

	if (file) {
		file = file.replace('\\', '/');
	} else {
		console.warn('using default config file');
		file = './config/default.json';
	}

	let config;
	try {
		// Load the config values in from the json
		config = require(`.${file}`);
		Object.assign(this, config);
	} catch (e) {
		config = {};
		console.log(e);
		if (e.code === 'MODULE_NOT_FOUND') {
			throw new Error(`Cannot find ${file}`);
		} else {
			throw new Error('Your config file is incorrectly formatted, please check it at jsonlint.com');
		}
	}
	let authConfig;
	try {
		authConfig = require('../config/auth.json');
		if (authConfig) {
			Object.assign(this.beam, authConfig);
		}
	} catch (e) {
		authConfig = null;
		console.warn('Please move your authenication data to auth.json.');
	}
}

module.exports = Config;
