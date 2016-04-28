'use strict';
const robot = require('robot-js');

const keyboard = robot.Keyboard();
const keycode = require('keycode');

const replacementMap = {
	esc: 'escape'
};

function convert(key) {
	if (typeof key === 'string') {
		key = keycode(key);
	}
	return key;
}

module.exports = {
	press(key) {
		keyboard.press(convert(key));
	},
	release(key) {
		keyboard.release(convert(key));
	},
	tap(key) {
		keyboard.click(convert(key));
	}
};
