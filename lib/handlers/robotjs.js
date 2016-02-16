var robot = require('robotjs');
var keycode = require('keycode');

function convert(key) {
	if(typeof key === 'number') {
			key = keycode(key);
	}
	//Robot js complains about UP but not W, it likes lowercase though so we'll stick with that.
	return key.toLowerCase();
}

module.exports = {
	press: function(key) {
		robot.keyToggle(convert(key), 'down');
	},
	release: function(key) {
		robot.keyToggle(convert(key), 'up');
	},
	tap: function(key) {
		robot.keyTap(convert(key));
	}
}
