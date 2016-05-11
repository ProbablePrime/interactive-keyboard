'use strict';
/**
 * Screen consensuseses (consensusi) are hard.
 *
 * We get a new coordinate for this report and a numeric number of clicks
 *
 * @param  {[type]} controlState [description]
 * @return {[type]}              [description]
 */
module.exports = function (controlState) {
	const result = {};

	if (controlState.coordMean && controlState.coordMean.x && !isNaN(controlState.coordMean.x) && !isNaN(controlState.coordMean.y)) {
		result.x = controlState.coordMean.x;
		result.y = controlState.coordMean.y;
		return result;
	}
	return undefined;
};
