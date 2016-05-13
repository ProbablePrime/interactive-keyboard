'use strict';
module.exports = {
	createConstraints(windowDetails, border) {
		if (!windowDetails.title) {
			return;
		}
		return {
			x: {
				min: windowDetails.x + border.x.min,
				max: (windowDetails.x + border.x.min) + windowDetails.width - border.x.max
			},
			y: {
				min: windowDetails.y + border.y.min,
				max: (windowDetails.y + border.y.min) + windowDetails.height - border.y.max
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
