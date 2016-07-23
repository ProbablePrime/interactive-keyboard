'use strict';
const robot = require('robotjs');
const windowConstraints = require('../../contraints/window.js');

let constraints = {};
const mouse = {
	constrainToWindow(windowDetails) {
		constraints = windowConstraints.createConstraints(windowDetails);
	},
	leftClick() {
		mouse.checkBounds();
		robot.mouseToggle('down', 'left');
		setTimeout(() => {
			robot.mouseToggle('up', 'left');
		}, 200);
	},
	rightClick() {
		mouse.checkBounds();
		robot.mouseToggle('down', 'right');
		setTimeout(() => {
			robot.mouseToggle('up', 'right');
		}, 200);
	},
	hold(button, action) {
		robot.mouseToggle(action ? 'down' : 'up', button);
	},
	leftHold(action) {
		mouse.checkBounds();
		mouse.hold('left', action);
	},
	rightHold(action) {
		mouse.checkBounds();
		mouse.hold('right', action);
	},
	checkBounds() {
		const current = robot.getMousePos();
		if (!windowConstraints.inBounds(constraints, current)) {
			mouse.constrainedMove(current.x, current.y);
		}
	},
	constrainedMove(x, y) {
		const xC = constraints.x;
		const yC = constraints.y;
		robot.moveMouseSmooth(windowConstraints.clamp(x, xC.min, xC.max), windowConstraints.clamp(y, yC.min, yC.max));
	},
	moveTo(x, y) {
		const current = robot.getMousePos();
		if (constraints && constraints.x && constraints.x.min) {
			mouse.constrainedMove(current.x + x, current.y + y);
		} else {
			robot.moveMouseSmooth(current.x + x, current.y + y);
		}
	},
	relativeConstrainedMove(x, y) {
		const xFinal = constraints.x.min + mouse.localToGlobal(x, constraints.width);
		const yFinal = constraints.y.min + mouse.localToGlobal(y, constraints.height);
		if (constraints && constraints.x && constraints.x.min) {
			robot.constrainedMove(xFinal, yFinal);
		} else {
			robot.moveMouseSmooth(xFinal, yFinal);
		}
	},
	localToGlobal(current, max) {
		return Math.min(0, current * max);
	}
};

module.exports = mouse;
