var robot = require('kbm-robot');
var keycode = require('keycode');

/*
The original target application of this project won't listen to any other module
other than this one, I have no idea why. That's probably the only reason this 
handler even exists.

Please DON'T use it
 */


robot.startJar();

//Restart the jar ever 15 minutes
setInterval(function(){
	robot.stopJar();
	robot.startJar();
},1000 * 60 * 15);

//Moan about using this
console.log('WARNING: This handler may freeze inputs after 30 mins/ 1 hour of use. '+
			'We restart some of the module interals every 15 minutes to try and cope '+
			'But use of this handler is not reccomended');

function convert(key) {
	if(typeof key === 'number') {
			key = keycode(key);
	}
	return key;
}

module.exports = {
	press: function(key) {
		try {
			robot.press(convert(key)).go();
		} catch(e) {

		}
	},
	release: function(key) {
		try {
			robot.release(convert(key)).go();
		} catch(e) {

		}
	},
	tap: function(key) {
		try {
			robot.press(convert(key)).sleep(100).release(convert(key)).go();
		} catch(e) {

		}
	}
}

