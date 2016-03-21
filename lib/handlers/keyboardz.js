const keycode = require('keycode');
const keyboardz = require('keyboardz');

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function convert(key) {
	if (typeof key === 'number') {
		key = keycode(key);
	}
	// KEYBOARDS requires N1 for 1, N2 for 2 etc
	if (isNumeric(key)) {
		key = `N${key}`;
	}
	return key;
}

module.exports = {
	press(key) {
		keyboardz.holdKey(convert(key));
	},
	release(key) {
		keyboardz.releaseKey(convert(key));
	},
	tap(/* key*/) {
		// robot.keyTap(convert(key));
	}
};
