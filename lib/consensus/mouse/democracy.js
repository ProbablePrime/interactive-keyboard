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

module.exports = function (joyStickState, users, config, controlState) {
	var result = {};
	if (joyStickState.coordMean && joyStickState.coordMean.X) {
		result.x = joyStickState.coordMean.X;
		result.y = joyStickState.coordMean.Y;
		result.intensity = clamp(Math.sqrt(result.x * result.x + result.y * result.y), 0, 1);
		result.x = joyStickState.coordMean.X * multiplier * result.intensity;
		result.y = joyStickState.coordMean.Y * multiplier * result.intensity;
		result.angle = Math.atan2(result.x, result.y) + ANGLE_OFFSET;

		return result;
	}
	return undefined;
};
