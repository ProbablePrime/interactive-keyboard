// Mostly borrowed from https://github.com/WatchBeam/agar-node-robot/blob/master/index.js
const ANGLE_OFFSET = Math.PI / 2;
const multiplier = 20;
function clamp(val, min, max) {
	if (val < min) {
		return min;
	}
	if (val > max) {
		return max;
	}
	return val;
}

function formula(value, multiplier, intensity) {
	return value * (multiplier * intensity);
}

function intensity(x, y) {
	return clamp(Math.sqrt(x * x + y * y), 0, 1);
}

module.exports = function (joyStickState) {
	var result = {};
	if (joyStickState.coordMean && joyStickState.coordMean.x) {
		result.x = joyStickState.coordMean.x;
		result.y = joyStickState.coordMean.y;
		result.intensity = intensity(result.x, result.y);
		result.x = formula(result.x, multiplier, result.intensity);
		result.y = formula(result.y, multiplier, result.intensity);
		result.angle = Math.atan2(result.x, result.y) + ANGLE_OFFSET;

		return result;
	}
	return undefined;
};
