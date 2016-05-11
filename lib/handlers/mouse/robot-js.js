"use strict";
const robot = require('robot-js');
const windowConstraints = require('../../constraints/window.js');

/* eslint-disable babel/new-cap */
const mouse = robot.Mouse();
/* eslint-enable babel/new-cap */

let constraints = {};
const mouseExport = {
	constrainToWindow(windowDetails) {
		constraints = windowConstraints.createConstraints(windowDetails);
	},
	leftClick() {
		mouseExport.checkBounds();
		mouse.click(robot.BUTTON_LEFT);
	},
	rightClick() {
		mouseExport.checkBounds();
		mouse.click(robot.BUTTON_RIGHT);
	},
	leftHold(action) {
		mouseExport.checkBounds();
		mouseExport.hold(robot.BUTTON_LEFT, action);
	},
	rightHold(action) {
		mouseExport.checkBounds();
		mouseExport.hold(robot.BUTTON_RIGHT, action);
	},
	hold(button, action) {
		if (action) {
			mouse.press(button);
		} else {
			mouse.release(button);
		}
	},
	checkBounds() {
		const current = robot.Mouse.getPos();
		if (!windowConstraints.inBounds(constraints, current)) {
			mouseExport.constrainedMove(current.x, current.y);
		}
	},
	constrainedMove(x, y) {
		const xC = constraints.x;
		const yC = constraints.y;
		mouseExport.setPos(windowConstraints.clamp(x, xC.min, xC.max), windowConstraints.clamp(y, yC.min, yC.max));
	},
	moveTo(x, y) {
		const current = robot.getMousePos();
		if (constraints) {
			mouseExport.constrainedMove(current.x + x, current.y + y);
		} else {
			mouseExport.setPos(current.x + x, current.y + y);
		}
	},
	relativeConstrainedMove(x, y) {
		const xFinal = constraints.x.min + mouseExport.localToGlobal(x, constraints.x.max);
		const yFinal = constraints.y.min + mouseExport.localToGlobal(y, constraints.y.max);
		if (constraints && constraints.x && constraints.x.min) {
			mouseExport.constrainedMove(xFinal, yFinal);
		} else {
			mouseExport.moveTo(xFinal, yFinal);
		}
	},
	localToGlobal(current, max) {
		return Math.abs(max * current);
	},
	setPos(x, y) {
		return robot.Mouse.setPos(x, y);
	}
};

module.exports = mouseExport;
