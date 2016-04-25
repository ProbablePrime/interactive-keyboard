'use strict';
const Beam = require('beam-client-node');
const Tetris = require('beam-interactive-node');
const Packets = require('beam-interactive-node/dist/robot/packets').default;

const State = require('./lib/state/ControlState');
const ControlsProcessor = require('./lib/ControlsProcessor');
const Config = require('./lib/Config');
const enhanceState = require('./lib/state/enhancer');
const reconnector = require('./lib/reconnector');

const args = process.argv.slice(2);
const file = args[0];
const config = new Config(file);

let state;
let widgets;
let channelID;
const beam = new Beam();
let robot = null;

if (config.widgets !== undefined && config.widgets) {
	widgets = require('./lib/widgets');
} else {
	widgets = function () {};
}
const processor = new ControlsProcessor(config);

processor.on('changed', report => {
	widgets(report);
});

/**
 * Our report handler, entry point for data from beam
 * @param  {Object} report Follows the format specified in the latest tetris.proto file
 */
function handleReport(report) {
	// Each report needs to be treated by itself and thus we can't carry any references through
	// If we do newer reports will update some state before we've processed it.
	// Due to this we're doing Immuteable style design with the report
	// Eventually I might make everything here Imuteable but for now just making
	// each report run in sequence will do
	const enhancedState = enhanceState(report, state);
	const progress = processor.process(enhancedState, state);
	if (robot !== null) {
		if (progress.tactile.length !== 0 || progress.joystick.length !== 0) {
			robot.send(new Packets.ProgressUpdate(progress));
		}
	}
	if (!report.tactile.length && report.users.active === 0) {
		processor.clearKeys(state.tactiles);
	}
}

// clear the keys on exit?? Ctrl+C doesn't appear to send this event
process.on('exit', code => {
	console.log(`exiting due to ${code}`);
	console.log('clearing your keys');
	processor.clearKeys(state);
});
process.on('SIGINT', () => {
	console.log('SIGINT');
	console.log('clearing your keys');
	processor.clearKeys(state);
	process.exit();
});

function getChannelID(channelName) {
	return beam.request('GET', `channels/${channelName}`).then(res => {
		channelID = res.body.id;
		return res.body.id;
	});
}

// interactive: true, tetrisGameId: versionId, tetrisShareCode: :code
function goInteractive(versionCode, shareCode) {
	return beam.request('PUT', `channels/${channelID}`, {body: {
		interactive: true,
		tetrisGameId: versionCode,
		tetrisShareCode: shareCode
	}, json: true});
}

function validateControls(controls) {
	if (!controls.tactiles || controls.tactiles.length === 0) {
		throw new Error('No buttons defined, please define some buttons in the beam lab');
	}
	const analysis = controls.tactiles.every(tactile => {
		return (tactile.analysis.holding && tactile.analysis.frequency);
	});
	if (!analysis) {
		// throw new Error("Buttons require holding and frequency to be checked for analysis");
	}

	const keyCodes = controls.tactiles.every(tactile => {
		return (tactile.key >= 8 && tactile.key < 300);
	});
	if (!keyCodes) {
		// throw new Error("Some invalid keycodes were found in your beam controls. Check them at keycode.info");
	}
	return controls;
}

function getControls(channelID) {
	return beam.request('GET', `tetris/${channelID}`)
	.then(res => {
		return res.body.version.controls;
	}, () => {
		throw new Error('Incorrect version id or share code in your config or no control layout saved for that version.');
	});
}

function createState(controls) {
	return new State(controls);
}

function validateConfig() {
	if (!config) {
		throw new Error('Missing config file cannot proceed, Please create a config file. Check the readme for help!');
	}
	if (!config.version || !config.code) {
		throw new Error('Missing version id and share code. These are required for now');
	}
	const needed = ['channel', 'password', 'username'];
	needed.forEach(value => {
		if (!config.beam[value]) {
			throw new Error(`Missing ${value} in your config file. Please add it to the file. Check the readme if you are unsure!`);
		}
	});
}

function setup() {
	validateConfig();
	try {
		const streamID = parseInt(config.beam.channel, 10);
		if (!streamID.isNAN()) {
			go(streamID);
		}
	} catch (e) {
		let target = config.beam.channel;
		if (!target) {
			target = config.beam.username;
		}
		console.log(`Using ${target}`);
		getChannelID(target).then(result => {
			if (result) {
				go(result);
			}
		});
	}
}

function onInteractiveConnect(err) {
	if (err) {
		console.log('Theres a problem connecting to tetris');
		console.log(err);
	} else {
		console.log('Connected to Tetris');
	}
}

function launchInteractive(beam, id) {
	return beam.game.join(id).then(details => {
		console.log('Authenticated, Spinning up Tetris Connection');
		const tetrisDetails = {};
		tetrisDetails.remote = details.body.address;
		tetrisDetails.key = details.body.key;
		tetrisDetails.channel = id;
		robot = new Tetris.Robot(tetrisDetails);
		robot.handshake(onInteractiveConnect);
		robot.on('report', handleReport);
		robot.on('error', code => console.log(code));
		reconnector(robot, launchInteractive.bind(this, beam, id), onInteractiveConnect);
	});
}

function go(id) {
	beam.use('password', {
		username: config.beam.username,
		password: config.beam.password
	}).attempt()
	.then(() => {
		return goInteractive(config.version, config.code);
	}).then(() => {
		return getControls(channelID);
	}).then(controls => {
		return validateControls(controls);
	}).then(controls => {
		state = createState(controls);
		return state;
	}).then(launchInteractive.bind(this, beam, id))
	.catch(err => {
		if (err.message !== undefined && err.message.body !== undefined) {
			console.log(err);
		} else {
			throw err;
		}
	});
}

setup();
