'use strict';
const util = require('../util');

module.exports = function (report, controlState) {
	Object.freeze(report);
	const base = {};
	base.users = Object.assign({}, report.users);
	if (report.tactile.length) {
		base.tactile = enhanceTactiles(report.tactile, controlState, report.users);
	}
	base.joystick = report.joystick.slice(0);
	return base;
};

function enhanceTactiles(tactiles, controlState, users) {
	return tactiles.map(tactile => enhanceTactile(tactile, controlState, users));
}

function enhanceTactile(tactile, controlState, users) {
	const enhancements = {
		pressFrequency: util.nullToZero(tactile.pressFrequency),
		releaseFrequency: util.nullToZero(tactile.releaseFrequency),
		holding: util.nullToZero(tactile.holding),
		percentHolding: util.percentage(tactile.holding, users.quorum),
		percentPushing: util.percentage(tactile.pressFrequency, users.quorum),
		percentReleasing: util.percentage(tactile.releaseFrequency, users.quorum)
	};
	const control = controlState.getTactileById(tactile.id);
	const controlVariables = {};
	if (control) {
		controlVariables.label = control.label;
		controlVariables.code = control.code;
		controlVariables.name = control.name;
	}
	return Object.assign({}, tactile, enhancements, controlVariables);
}
