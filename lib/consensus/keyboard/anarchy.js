'use strict';
/**
 * Given a report, workout what should happen to the key.
 * @param  {Object} keyState the internal state
 * @return {Boolean} true to push AND HOLD the button, false to let go. null to do nothing.
 */
const utils = require('../../util.js');
module.exports = function (keyState, users) {
	const decision = {
		action: false,
		progress: 0
	};
	if ((keyState.pressFrequency - keyState.releaseFrequency) > 0) {
		decision.action = true;
	} else {
		decision.action = false;
	}

	decision.progress = utils.calculateFocus(keyState.pressFrequency, users.quorum);

	return decision;
};
