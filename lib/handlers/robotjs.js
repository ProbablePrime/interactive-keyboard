const robot = require('robotjs');
const keycode = require('keycode');

const replacementMap = {
	esc: 'escape'
};

function convert(key) {
	if (typeof key === 'number') {
		key = keycode(key);
	}

	// Robot js complains about UP but not W, it likes lowercase though so we'll stick with that.
	key = key.toLowerCase();
	if (replacementMap[key]) {
		return replacementMap[key];
	}
	return key;
}

module.exports = {
	press(key) {
		robot.keyToggle(convert(key), 'down');
	},
	release(key) {
		robot.keyToggle(convert(key), 'up');
	},
	tap(key) {
		robot.keyTap(convert(key));
	}
};
