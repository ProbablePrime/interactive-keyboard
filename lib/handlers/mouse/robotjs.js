const robot = require('robotjs');

let constraints = {};
const borderX = 10;
const borderY = 5;
const mouse = {
	constrainToWindow(windowDetails) {
		if (!windowDetails.title) {
			return;
		}
		constraints = {
			x: {
				min: windowDetails.x + borderX,
				max: (windowDetails.x + borderX) + windowDetails.width - (borderX + 15)
			},
			y: {
				min: windowDetails.y + 30,
				max: (windowDetails.y + borderY) + windowDetails.height - (borderY + 20)
			}
		};
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
	clamp(val, min, max) {
		if (val < min) {
			return min;
		}
		if (val > max) {
			return max;
		}
		return val;
	},
	checkBounds() {
		const current = robot.getMousePos();
		if (!mouse.inBounds()) {
			mouse.constrainedMove(current.x, current.y);
		}
	},
	inBounds() {
		const current = robot.getMousePos();
		if (current.x > constraints.x.max || current.x < constraints.x.min) {
			return false;
		}
		if (current.y > constraints.y.max || current.y < constraints.y.min) {
			return false;
		}
		return true;
	},
	constrainedMove(x, y) {
		const xC = constraints.x;
		const yC = constraints.y;
		robot.moveMouseSmooth(mouse.clamp(x, xC.min, xC.max), mouse.clamp(y, yC.min, yC.max));
	},
	moveTo(x, y) {
		const current = robot.getMousePos();
		if (constraints) {
			mouse.constrainedMove(current.x + x, current.y + y);
		} else {
			robot.moveMouseSmooth(current.x + x, current.y + y);
		}
	}
};

module.exports = mouse;
