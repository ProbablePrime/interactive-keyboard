var robot = require('robotjs');

var constraints;

module.exports = {
	leftClick: function () {
		robot.mouseClick('left', false);
	},
	rightClick: function () {
		robot.mouseClick('right', false);
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
		if (constraints) {
			module.exports.constrainedMove(x, y);
		} else {
			robot.moveMouseSmooth(x, y);
		}
	}
};
