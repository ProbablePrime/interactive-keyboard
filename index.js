var Beam = require('beam-client-node');
var Tetris = require('beam-interactive-node');

//Transforms codes(65) into key names(A) and visa versa
var keycode = require('keycode');

var args = process.argv.slice(2);

var configFile;
configFile = args[0];

if(configFile) {
    configFile = configFile.replace('\\','/');
} else {
    console.warn('using default config file');
    configFile = './config/default.json';
}
var config;
try {
    //Load the config values in from the json
    config = require(configFile);
} catch(e) {
    if(e.code === 'MODULE_NOT_FOUND') {
        console.log('Cannot find '+ configFile);
    } else {
        console.log('Your config file is incorrectly formatted, please check it at jsonlint.com');
    }
    process.exit();
}

//Remapping is now optional
if(!config.remap) {
    config.remap = false;
}

//We now support multiple keyboard handlers. They can be defined in the config
//We'll default to the better one
if(!config.handler) {
    config.handler = 'robotjs';
}

var controls = require('./lib/handlers/'+config.handler+'.js');

var Packets = require('beam-interactive-node/dist/robot/packets');

var username = config.beam.username
var password = config.beam.password;

//50% of users must be voting on an action for it to happen
var tactileThreshold = config.threshold || 0.5;

var beam = new Beam();

var robot = null;

var recievingReports = true;
var keysToClear = [];

var channelID = 0;

var state = {};

/* My onscreen controls are likely to be controls a player(streamer) might use if they don't have a gamepad.
   So we remap keys from the report to lesser used keys here. Ideally id like to emulate a HID and pass beam events through that.
   That way the streamer can type in chat without 123129301293120392 appearing. However the interface allows you to toggle interactive mode
   and the streamer has a microphone too!

   This is defineable in in the config
   Example:
   "remapTable": {
        "W":"1",
        "S":"2",
        "A":"3",
        "D":"4",
        "J":"5",
        "K":"6",
        "L":"7",
        "I":"8"
    }
*/
if(!config.remapTable) {
    config.remapTable = [];
}
var remap = config.remapTable;

function remapKey(code) {
    var stringCode;
    if(typeof code === 'number') {
        stringCode = keycode(code).toUpperCase();
    } else {
        stringCode = code;
    }

     if(remap[stringCode]) {
        return remap[stringCode].toLowerCase();
    }
    return code;
}

/**
 * Our report handler, entry point for data from beam
 * @param  {Object} report 
 */
function handleReport(report) {
    //console.log(report)
    //if no users are playing or there's a brief absence of activity
    //the reports contain no data in the tactile/joystick array. So we detect if there's data
    //before attempting to process it

    if(report.tactile.length && report.users.quorum > 0) {
        recievingReports = true;
        handleTactile(report.tactile,report.users);
    } else {
        recievingReports = false;
    }
}

/**
 * Watchdog gets called every 500ms to check the status of the reports coming into us from beam.
 * If we havent had any reports that contained usable data in (5 * 500ms)(2.5s) we clear all the
 * inputs that the game uses. This allows the second "player"(controlled by beam to not continue).
 * Stopping and standing still seemed to be better than "CONTINUE RUNNING YAY"
 * @return {[type]} [description]
 */
function watchDog() {
    if(!recievingReports) {
        if(dogCount === 5) {
            console.log('clearing player input due to lack of reports.');
            setKeys(Object.keys(map), false, config.remap);
        }
        dogCount = dogCount + 1;
    } else {
        dogCount = 0;
    }
}

/**
 * Given a report, workout what should happen to the key.
 * @param  {Object} keyObj Directly from the report.tactile array
 * @return {Boolean} true to push AND HOLD the button, false to let go. null to do nothing.
 */
function tactileDecisionMaker(keyObj, quorum) {

    if(keyObj.holding === null) {
        keyObj.holding = 0;
    }
    if(keyObj.pressFrequency === null) {
        keyObj.pressFrequency = 0;
    }
    if(keyObj.releaseFrequency === null) {
        keyObj.releaseFrequency = 0;
    }

    var ret = {
        action: false,
        percentHolding:0,
        percentPushing:0,
        percentReleasing:0
    };
    if(quorum > 0) {
        if(keyObj.holding > 0) {
            ret.percentHolding = (keyObj.holding / quorum);
        }
        if(keyObj.pressFrequency > 0) {
            ret.percentPushing = (keyObj.pressFrequency / quorum);
        }
        if(keyObj.releaseFrequency > 0) {
            ret.percentReleasing = (keyObj.releaseFrequency / quorum);
        }
    }

    if(!quorum) {
        ret.action = null;
    }

    ret.progress = ret.percentHolding;

    if(ret.percentHolding >= 0.5) {
        ret.action = true;
    }

    return ret;
}

function createProgressForKey(keyObj,result) {
    if(keyObj.id === undefined) {
        return;
    }
    if(typeof keyObj.id === "string") {
        keyObj.id = parseInt(keyObj.id, 10);
    }
    return new Packets.ProgressUpdate.TactileUpdate({
        id: keyObj.id,
        cooldown:0,
        fired: result.action,
        progress: result.progress
    });
}

/**
 * Workout for each key if it should be pushed or unpushed according to the report.
 * @param {[type]} keyObj [description]
 */
function setKeyState(users,keyObj) {

    //Pull the code from our map of ids -> codes
    keyObj.code = getKeyCodeForID(keyObj.id);

    //Keep a list of keys that we need to clear when
    //there's a lack of input.
    //We do it via ids
    if(keysToClear.indexOf(keycode(keyObj.code)) === -1) {
        keysToClear.push(keycode(keyObj.code));
    }

    keyObj.original = keyObj.code;

    //Remappa if enabled
    if(config.remap) {
        keyObj.code = remapKey(keyObj.code);
    }

    var decision = tactileDecisionMaker(keyObj, users.active);
    if(decision !== null && decision.action !== null) {
        if(state[keyObj.original] !== decision.action) {
            console.log(keycode(keyObj.original), decision.action,
                ' U'+ users.active,
                ' %s:',
                ' H'+decision.percentHolding,
                ' P'+decision.percentPushing,
                ' R'+decision.percentReleasing);

            setKey(keyObj.code, decision);
            state[keyObj.original] = decision.action;

            return createProgressForKey(keyObj, decision);
        }
    }
}

function handleTactile(tactile, users) {
    var progress = tactile.map(setKeyState.bind(this,users));

    //Remove undefineds from map
    progress = progress.filter(function(progress){
        return progress !== undefined;
    })

    if(!tactile) {
        tactile = [];
    }

    //Don't send progress updates we don't need
    if(!progress.length) {
        return;
    }
    if(robot !== null) {
        var args = {
            joystick:[],
            tactile: progress
        };
        robot.send(new Packets.ProgressUpdate(args));
    }
}

/**
 * Convinience function that loops through an array of keys and sets them to status
 * @param {String[]|Number[]} keys   Keys to modify
 * @param {Boolean} status status true to push AND HOLD the button, false to let go. null to do nothing.
 * @param {Boolean} remap  True to also run the keys through the remapping routine.
 */
function setKeys(keys, status, remap) {
    var progressArray = [];
    keys.forEach(function(value) {
        progressArray.push(createProgressForKey({id:value}, {action:status, progress:(status) ? 1 : 0}));
    });
    if(robot !== null) {
        var args = {
            joystick:[],
            tactile: codes
        };
        robot.send(new Packets.ProgressUpdate({
           tactile: codes
        }));
    }

    keys = keys.map(getKeyCodeForID);
    if(remap) {
        keys = keys.map(remapKey);
    }
    keys.forEach(function(key) {
        setKey(key,status);
    });
}

function setKey(key,status) {

    //Beam reports back keycodes, convert them to keynames, which robotjs accepts
    if(typeof key === 'number') {
        key = keycode(key);
    }

    //Something in remapping or handling sometimes makes this undefined
    //It causes an error to proceed so we'll stop here
    if(!key) {
        return;
    }

    if(status) {
        controls.press(key.toUpperCase());
    } else {
        controls.release(key.toLowerCase());
    }
}

function getChannelID(channelName) {
    return beam.request('GET','channels/'+channelName).then(function(res) {
        channelID = res.body.id;
        return res.body.id;
    });
}

//interactive: true, tetrisGameId: versionId, tetrisShareCode: :code
function goInteractive(versionCode,shareCode) {
     return beam.request('PUT','channels/'+channelID, {body:{
        interactive: true,
        tetrisGameId: versionCode,
        tetrisShareCode: shareCode
     },json:true});
}

var map = {};
function getKeyCodeForID(id) {
    return map[id];
}
/**
 * The new controls editor/controls protocol doesn't send down the keycode.
 * Pull the controls grid that players see from beam, build a map of, button id -> keycode
 * @param  {Number} channelID
 */
function buildControlMap(channelID) {
    beam.request('GET','tetris/'+channelID)
    .then(function(res) {
        var controls = res.body.version.controls.tactiles;
        controls.forEach(function(tactile) {
            map[tactile.id] = tactile.key;
        });
        return map;
    });
}

function validateConfig() {
     if(!config) {
        console.log('Missing config file cannot proceed, Please create a config file. Check the readme for help!');
        process.exit();
    }
    if(!config.version || !config.code) {
        console.log('Missing version id and share code. These are required for now');
        process.exit();
    }
    var needed = ["channel","password","username"];
    needed.forEach(function(value){
        if(!config.beam[value]) {
            console.error("Missing "+value+ " in your config file. Please add it to the file. Check the readme if you are unsure!");
            process.exit();
        }
    });
}

function setup() {
    validateConfig();

    try {
        var streamID = parseInt(config.beam.channel,10);
        if(!steamID.isNAN()) {
            go(streamID);
        }
    } catch (e) {
        var target = config.beam.channel;
        if(!target) {
            target = config.beam.username;
        }
        console.log('Using '+ target);
        getChannelID(target).then(function(result) {
            if(result) {
                go(result);
            }
        }, function(e) {
            console.log('Invalid channel specified in config file, or no channel found on beam');
            process.exit();
        })
    }
}

function go(id) {
    beam.use('password', {
        username: username,
        password: password
    }).attempt()
    .then(function(){
        return goInteractive(config.version, config.code);
    }).then(function() {
        return buildControlMap(channelID);
    }).then(function () {
        return beam.game.join(id);
    }).then(function (details) {
        console.log('Authenticated, Spinning up Tetris Connection');
        details = details.body;
        details.remote = details.address;
        details.channel = id;
        robot = new Tetris.Robot(details);
        robot.handshake(function(err){
            if(err) {
                console.log('Theres a problem connecting to tetris, show this to a codey person');
                console.log(err);
            } else {
                console.log('Connected to Tetris');
            }
        });
        robot.on('report',handleReport);
        setInterval(watchDog,500);
    }).catch(function(err){
        if(err.message !== undefined && err.message.body !== undefined) {
            err = err.message.body;
        } else {
            throw err;
        }
    });
}

setup();
