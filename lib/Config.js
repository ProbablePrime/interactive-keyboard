'use strict';
const errors = require('./errors.js');
function Config(file) {
	this.beam = {};
	this.blocks = {};
	this.remap = false;
	this.remapTable = {};
	this.tactileThreshold = 0.1;
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
		if (typeof config.password === "string" || (config.beam && typeof config.beam.password === "string")) {
			throw new errors.AuthDataError();
		}
		Object.assign(this, config);
	} catch (e) {
		config = {};
		if (e.code === 'MODULE_NOT_FOUND') {
			throw new Error(`Cannot find ${file}`);
		}
		if (e instanceof errors.AuthDataError) {
			throw e;
		}
		throw new Error('Your config file is incorrectly formatted, please check it at jsonlint.com');
	}
	let authConfig;
	try {
		authConfig = require('../config/auth.json');
		if (authConfig) {
			if (authConfig.password && authConfig.token) {
				throw new errors.ConfusingAuthError();
			}
			Object.assign(this.beam, authConfig);
		}
	} catch (e) {
		authConfig = null;
		if (e.code === 'MODULE_NOT_FOUND') {
			throw new Error('Missing auth.json cannot proceed');
		}
		throw e;
	}
}

module.exports = Config;
