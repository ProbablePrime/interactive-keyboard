var robot = require('robotjs');

var constraints = {};
var borderX = 10;
var borderY = 5;
module.exports = {
	constrainToWindow: function (windowDetails) {
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
	leftClick: function () {
		robot.mouseToggle('down','left');
		setTimeout(() => {
			robot.mouseToggle('up','left');
		},200);
	},
	rightClick: function () {
		robot.mouseToggle('down','right');
		setTimeout(() => {
			robot.mouseToggle('up','right');
		},200);
	},
	clamp: function (val, min, max) {
		if (val < min) {
			return min;
		}
		if (val > max) {
			return max;
		}
		return val;
	},
	constrainedMove: function (x, y) {
		var xC = constraints.x;
		var yC = constraints.y;
		robot.moveMouseSmooth(module.exports.clamp(x, xC.min, xC.max), module.exports.clamp(y, yC.min, yC.max));
	},
	moveTo: function (x, y) {
		var current = robot.getMousePos();
		if (constraints) {
			module.exports.constrainedMove(current.x + x, current.y + y);
		} else {
			robot.moveMouseSmooth(current.x + x, current.y + y);
		}
	}
};
