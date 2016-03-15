var robot = require('robotjs');
var keycode = require('keycode');

var replacementMap = {
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
	console.log(key);
	return key;
}

module.exports = {
	press: function (key) {
		robot.keyToggle(convert(key), 'down');
	},
	release: function (key) {
		robot.keyToggle(convert(key), 'up');
	},
	tap: function (key) {
		robot.keyTap(convert(key));
	}
};
