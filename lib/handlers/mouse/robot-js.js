const robot = require('robot-js');
const windowConstraints = require('../../contraints/window.js');

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
	checkBounds() {
		const current = robot.getMousePos();
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
	}
};

module.exports = mouseExport;
