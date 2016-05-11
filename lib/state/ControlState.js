'use strict';
const Tactile = require('./Tactile');
const JoyStick = require('./JoyStick');
const util = require('../util');

/**
 * Control state is an easily queryable copy of the controls object
 * that beam provides from the controls editor.
 */
function ControlState(controls) {
	this.tactiles = [];
	this.joysticks = [];
	this.users = {};
	this.qgram = [];
	this.status = '';
	this.controlControlState = 'default';

	controls.joysticks.forEach(this.createJoyStick.bind(this));
	controls.tactiles.forEach(this.createTactile.bind(this));
}

ControlState.prototype.createTactile = function (tactileControl) {
	const tactile = new Tactile(tactileControl);
	this.tactiles.push(tactile);
	return tactile;
};

ControlState.prototype.createJoyStick = function (joystickControl) {
	const joystickObj = new JoyStick(joystickControl);
	this.joysticks.push(joystickObj);
	return joystickObj;
};

ControlState.prototype.getTactile = function (keyName) {
	if (this.tactiles[keyName]) {
		return ControlState.tactiles[keyName];
	}
	return this.createTactile(keyName);
};

ControlState.prototype.getTactileByLabel = function (label) {
	const lowercaseLabel = label.toLowerCase();
	return util.convertToArray(this.tactiles).find(tactile => {
		return tactile.label.toLowerCase() === lowercaseLabel;
	});
};

ControlState.prototype.getTactileById = function (id) {
	return this.tactiles.find(tactile => tactile.id === id);
};

ControlState.prototype.getJoyStickById = function (id) {
	return this.joysticks.find(tactile => tactile.id === id);
};

module.exports = ControlState;
