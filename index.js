'use strict';
const Beam = require('beam-client-node');
const Tetris = require('beam-interactive-node');
const Packets = require('beam-interactive-node/dist/robot/packets').default;
const Promise = require('bluebird');

const auth = require('./lib/auth.js');

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
	// Due to this we're processing everything in an Immuteable style.
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

process.on('exit', code => {
	console.log(`Process is exiting wih code: ${code}`);
	processor.clearKeys(state);
});
process.on('SIGINT', () => {
	console.log('SIGINT');
	processor.clearKeys(state);
	process.exit();
});

function getChannelID(channelName) {
	return beam.request('GET', `channels/${channelName}`).then(res => {
		channelID = res.body.id;
		return res.body.id;
	});
}

function goInteractive(versionCode, shareCode) {
	return beam.request('PUT', `channels/${channelID}`, {body: {
		interactive: true,
		tetrisGameId: versionCode,
		tetrisShareCode: shareCode
	}, json: true}).then(res => {
		if (res.statusCode !== 200 || !res.body.interactive) {
			throw new Error('Couldn\'t set channel to interactive with that game.');
		}
	});
}

function checkInteractive() {
	return beam.request('GET', `channels/${channelID}?fields=interactive`).then(res => {
		return res.body && res.body.interactive;
	});
}

function hasControls(type, controls) {
	return controls[type] && controls[type].length;
}

function hasSomeControls(controls) {
	return hasControls('tactiles', controls) || hasControls('joysticks', controls) || hasControls('screens', controls);
}

function validateControls(controls) {
	if (!hasSomeControls(controls)) {
		throw new Error('No controls found');
	}
	return controls;
}

function getControls(version, code) {
	return beam.request('GET', `tetris/versions/${version}?code=${code}`)
	.then(res => {
		if (!res.body.controls) {
			throw new Error('Incorrect version id or share code in your config or no control layout saved for that version.');
		}
		return res.body.controls;
	}).catch(() => {
		throw new Error('Problem retrieving controls');
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
}

function setup() {
	validateConfig();
	console.log(`Using ${config.beam.username} with Version: ${config.version} && Code: ${config.code}`);
	getChannelID(config.beam.username).then(result => {
		if (result) {
			go(result);
		}
	});
}

function onInteractiveConnect(err) {
	if (err) {
		console.log('Theres a problem connecting to Interactive');
		console.log(err);
	} else {
		console.log('Connected to Interactive');
	}
}

function performRobotHandshake(robot) {
	return new Promise((resolve, reject) => {
		robot.handshake(err => {
			if (err) {
				reject(err);
			}
			onInteractiveConnect(err);
			resolve();
		});
	});
}

function launchInteractive(beam, id) {
	return beam.game.join(id).then(details => {
		console.log('Authenticated, Spinning up Interactive Connection');
		robot = new Tetris.Robot({
			remote: details.body.address,
			key: details.body.key,
			channel: id
		});
		robot.on('report', handleReport);
		robot.on('error', code => console.log(code));
		reconnector(robot, launchInteractive.bind(this, beam, id), onInteractiveConnect);
		return performRobotHandshake(robot);
	});
}

function go(id) {
	channelID = id;
	auth(config.beam, beam)
	.then(() => {
		return goInteractive(config.version, config.code);
	}).then(() => {
		return getControls(config.version, config.code);
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
