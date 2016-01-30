var robot = require('robotjs');
var keycode = require('keycode');

function convert(key) {
	if(typeof key === 'number') {
			key = keycode(key);
	}
	return key;
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
