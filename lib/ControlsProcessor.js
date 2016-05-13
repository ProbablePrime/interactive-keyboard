'use strict';
const keycode = require('keycode');
const util = require('./util');
const Packets = require('beam-interactive-node/dist/robot/packets').default;
const nodeUtil = require('util');
const EventEmitter = require('events').EventEmitter;

function ControlsProcessor(config) {
	this.config = config;

	this.joyStickConsensus = require(`./consensus/mouse/${config.joyStickConsensus}`);
	this.screenConsensus = require(`./consensus/screen/democracy.js`);
	this.consensus = require(`./consensus/keyboard/${config.consensus}`);

	this.handler = require(`./handlers/robot-js.js`);
	this.windowHandler = null;
	this.mouseHandler = null;

	if (this.config.mouseEnabled) {
		this.mouseHandler = require('./handlers/mouse/robot-js');
		if (this.config.windowTarget) {
			this.windowHandler = require('./handlers/window/robot-js');
			this.constrainWindow(this.config.windowTarget, this.config.windowBorder);
		}
	}
	EventEmitter.call(this);
}

nodeUtil.inherits(ControlsProcessor, EventEmitter);

ControlsProcessor.prototype.constrainWindow = function (title, border) {
	if (this.windowHandler !== null) {
		const details = this.windowHandler.getWindowInfo(title);
		if (details) {
			this.mouseHandler.constrainToWindow(details, border);
		}
	}
};

/**
 * Given a Key name "W" or a keycode 87 transform that key using the
 * remapping table from the config.
 * @param  {Number|String} code
 * @return {String} the keyname of the remapped key
 */
ControlsProcessor.prototype.remapKey = function (code) {
	let stringCode;
	if (typeof code === 'number') {
		stringCode = keycode(code).toUpperCase();
	} else {
		stringCode = code;
	}

	if (this.config.remap[stringCode]) {
		return this.config.remap[stringCode].toLowerCase();
	}
	return code;
};

ControlsProcessor.prototype.clearAllKeys = function () {
	// this.setKeys(Object.keys(map), false, config.remap);
};

ControlsProcessor.prototype.process = function (report, controlState) {
	const result = {
		state: 'default',
		tactile: [],
		joystick: []
	};
	if (report.screen && report.screen.length > 0) {
		result.screen = report.screen.map(screen => this.processScreen(controlState, report.users, screen))
		.filter(value => value !== undefined);
	}
	if (report.tactile && report.tactile.length > 0) {
		result.tactile = report.tactile.map(tactile => this.processTactile(controlState, report.users, tactile))
		.filter(value => value !== undefined);
	}
	if (report.joystick && report.joystick.length > 0) {
		result.joystick = report.joystick.map(joystick => this.processJoyStick(controlState, report.users, joystick))
		.filter(value => value !== undefined);
	}
	if (result.tactile.length > 0 || result.joystick.length > 0) {
		this.emit('changed', report, controlState);
	}
	return result;
};
ControlsProcessor.prototype.processTactile = function (controlState, users, tactileState) {
	const control = controlState.getTactileById(tactileState.id);
	let decision = this.consensus(tactileState, users, this.config);
	let changed = false;
	decision = this.checkBlocks(tactileState, decision, controlState);
	if (!decision || decision.action === null) {
		return undefined;
	}
	if (control.action !== decision.action) {
		changed = true;
		if (control.isMouseClick()) {
			this.handleClick(control.label.toLowerCase(), decision.action);
		} else {
			this.setKey(control.name, decision.action);
		}
		control.action = decision.action;

		if (control.action) {
			decision.cooldown = control.cooldown;
		} else {
			decision.cooldown = 0;
		}
	}
	if (decision.progress !== control.progress || changed) {
		changed = true;
		control.progress = decision.progress;
	}

	// Here we only send a progress update if something has changed. be it the progress
	if (changed) {
		return this.createProgressForKey(control, decision);
	}
	return undefined;
};

ControlsProcessor.prototype.processScreen = function (controlState, users, screenState) {
	if (!this.config.mouseEnabled || this.config.mouseSource !== 'screen') {
		return undefined;
	}
	const control = screenState;
	const result = this.screenConsensus(screenState, users, this.config, controlState);
	if (result) {
		this.mouseHandler.relativeConstrainedMove(result.x, result.y);
		return this.createProgressForScreen(control, result);
	}
};

ControlsProcessor.prototype.processJoyStick = function (controlState, users, joyStickState) {
	if (!this.config.mouseEnabled || this.config.mouseSource !== 'joystick') {
		return undefined;
	}
	const control = controlState.getJoyStickById(joyStickState.id);
	const result = this.joyStickConsensus(joyStickState, users, this.config, controlState);
	if (result) {
		// this.mouseHandler.moveTo(result.x, result.y);
		return this.createProgressForJoyStick(control, result);
	}
};

/**
 * Given a tactile state, an in progress decision and a set of 2 paired keys
 * Block the current key from being pushed if its paired key is down.
 * @param  {Object} keyState State to check
 * @param  {Object} decision Decision in progress
 * @param  {String} a        The first key in the pair, the one to block
 * @param  {String} b        The second key in the pair, the one to check for
 * @return {Object}          The updated decision
 */
ControlsProcessor.prototype.checkBlock = function (stateA, stateB, decision) {
	if (stateB && stateB.action) {
		decision.action = false;
		decision.progress = 0;
	}
	return decision;
};

/**
 * Give a tactile state loop through the blocks as defined in the config,
 * working out if this current decision should be blocked
 * @param  {Object} keyState State to check
 * @param  {Object} decision Current decision in progress
 * @return {Object}
 */
ControlsProcessor.prototype.checkBlocks = function (keyState, decision, state) {
	Object.keys(this.config.blocks).forEach(blockA => {
		if (keyState.label.toLowerCase() !== blockA.toLowerCase()) {
			return;
		}
		decision = this.checkBlock(keyState, state.getTactileByLabel(this.config.blocks[blockA]), decision);
	});
	return decision;
};
/**
 * Given a key name set it to the apropriate status
 * @param {String} keyName The key name, "W" and not 87
 * @param {Boolean} status  true to push the key, false to release
 */
ControlsProcessor.prototype.setKey = function (keyName, status) {
	// Beam reports back keycodes, convert them to keynames, which our handlers accept
	if (typeof keyName === 'number') {
		console.log('warning setting by number');
		keyName = keycode(keyName);
	}

	// Something in remapping or handling sometimes makes this undefined
	// It causes an error to proceed so we'll stop here
	if (!keyName) {
		return;
	}

	if (status) {
		this.handler.press(keyName.toUpperCase());
	} else {
		this.handler.release(keyName.toUpperCase());
	}
};

ControlsProcessor.prototype.handleClick = function (button, action) {
	if (button.search('left') !== -1) {
		//this.mouseHandler.leftClick();
		this.mouseHandler.leftHold(action);
		return;
	}
	if (button.search('right') !== -1) {
		//this.mouseHandler.rightClick();
		this.mouseHandler.rightHold(action);
		return;
	}
};

/**
 * Given a tactile from a Tetris report, generate a ProgressUpdate packet
 * to be sent back to Tetris
 * @param  {Object} keyObj The tactile from the report
 * @param  {Object} result The decision from the decision maker process
 * @return {Object}        The tactile progress update to be sent back to tetris
 */
ControlsProcessor.prototype.createProgressForKey = function (keyObj, result) {
	return new Packets.ProgressUpdate.TactileUpdate({
		id: keyObj.id,
		cooldown: keyObj.cooldown,
		fired: result.action,
		progress: result.progress
	});
};

ControlsProcessor.prototype.createProgressForJoyStick = function (state, result) {
	if (result) {
		return new Packets.ProgressUpdate.JoystickUpdate({
			id: state.id,
			angle: result.angle,
			intensity: result.intensity
		});
	}
};

ControlsProcessor.prototype.createProgressForScreen = function (state, result) {

};

ControlsProcessor.prototype.constrainMouse = function (mouseBounds) {
	this.mouseHandler.constrainMouse(mouseBounds);
};

ControlsProcessor.prototype.clearKeys = function (keysToClear) {
	util.convertToArray(keysToClear)
	.forEach(tactile => {
		if (tactile.action) {
			tactile.clear();
			this.setKey(tactile.name, false);
		}
	});
};

module.exports = ControlsProcessor;
