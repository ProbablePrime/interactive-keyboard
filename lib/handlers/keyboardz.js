var keycode = require('keycode');
var keyboardz = require('keyboardz');


function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function convert(key) {
	if(typeof key === 'number') {
			key = keycode(key);
	}
	//KEYBOARDS requires N1 for 1, N2 for 2 etc
	if(isNumeric(n)) {
		key = 'N'+key;
	}
	return key;
}

module.exports = {
	press: function(key) {
		keyboardz.holdKey(convert(key));
	},
	release: function(key) {
		keyboardz.releaseKey(convert(key));
	},
	tap: function(key) {
		//robot.keyTap(convert(key));
	}
}
