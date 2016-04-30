'use strict';
const borderX = 10;
const borderY = 5;
module.exports = {
	createConstraints(windowDetails) {
		if (!windowDetails.title) {
			return;
		}
		return {
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
	inBounds(constraints, current) {
		if (current.x > constraints.x.max || current.x < constraints.x.min) {
			return false;
		}
		if (current.y > constraints.y.max || current.y < constraints.y.min) {
			return false;
		}
		return true;
	},
	clamp(val, min, max) {
		if (val < min) {
			return min;
		}
		if (val > max) {
			return max;
		}
		return val;
	}
};
