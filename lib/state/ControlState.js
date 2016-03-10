var Tactile = require('./Tactile');
var JoyStick = require('./JoyStick');
var util = require('../util');
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
	var tactile = new Tactile(tactileControl);
	this.tactiles.push(tactile);
	return tactile;
};

ControlState.prototype.createJoyStick = function (joystick) {
	var joystick = new JoyStick(joystick);
	this.joysticks.push(joystick);
	return joystick;
};

ControlState.prototype.getTactile = function (keyName) {
	if (this.tactiles[keyName]) {
		return ControlState.tactiles[keyName];
	}
	return this.createTactile(keyName);
};

ControlState.prototype.getTactileByLabel = function (label) {
	var lowercaseLabel = label.toLowerCase();
	return util.convertToArray(this.tactiles).find((tactile) => {
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
