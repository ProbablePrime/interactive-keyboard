var Beam = require('beam-client-node');
var Tetris = require('beam-interactive-node');

var clear = require('clear');

var widgets = require('./lib/widgets');
//var widgets = function() {};

//Transforms codes(65) into key names(A) and visa versa
var keycode = require('keycode');
var equal = require('deep-equal');

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

var channelID = 0;

var state = {
    tactiles:{},
    qgram:[],
    status:''
};

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
    //Always try and keep the qgram up to date, but don't spam update it
    //Check if the stored qgram = the new qgram.
    if(!equal(report.users.qgram, state.qgram)) {
        widgets(state);
        state.qgram = report.users.qgram;
    }

    //if no users are playing or there's a brief absence of activity
    //the reports contain no data in the tactile/joystick array. So we detect if there's data
    //before attempting to process it
    if(report.tactile.length && report.users.quorum > 0) {
        handleTactile(report.tactile,report.users);
    } else {
        //I don't like this, need to refactor this if it fixes stuck keys
        var touchedAKey = false;
        Object.keys(state.tactiles)
        .forEach(function(key){
            var tactile = state.tactiles[key];
            if(tactile.action) {
                tactile.action = false;
                tactile.percentHolding = 0;
                tactile.percentReleasing = 1;
                tactile.percentPushing = 0;
                touchedAKey = true;
                setKey(tactile.name,false);
            }
        });
        if(touchedAKey) {
            widgets(state);
        }
    }
}

function clearKeys() {
    setKeys(Object.keys(map), false, config.remap);
}
//clear the keys on exit?? Ctrl+C doesn't appear to send this event
process.on('exit', function() {
    console.log('clearing your keys');
    clearKeys();
});
process.on('SIGINT', function() {
    console.log('clearing your keys');
    clearKeys();
    process.exit();
});


function updateState(keyObj,quorum) {
    if(keyObj.holding === null) {
        keyObj.holding = 0;
    }
    if(keyObj.pressFrequency === null) {
        keyObj.pressFrequency = 0;
    }
    if(keyObj.releaseFrequency === null) {
        keyObj.releaseFrequency = 0;
    }

    var ret = getStateForKey(keyObj.name);

    //We don't use these right now in our decision but good for people who want
    //to hack
    ret.pressFrequency = keyObj.pressFrequency;
    ret.releaseFrequency = keyObj.releaseFrequency;
    ret.holding = keyObj.holding;

    //Most of this block guards against dividing by 0 and negative percentages
    //which make the progress bar go backwards
    if(quorum > 0) {
        if(keyObj.holding > 0) {
            ret.percentHolding = Math.abs(keyObj.holding / quorum);
        } else {
            ret.percentHolding = 0;
        }
        if(keyObj.pressFrequency > 0) {
            ret.percentPushing = Math.abs(keyObj.pressFrequency / quorum);
        } else {
            ret.percentPushing = 0;
        }
        if(keyObj.releaseFrequency > 0) {
            ret.percentReleasing = Math.abs(keyObj.releaseFrequency / quorum);
        } else {
            ret.percentReleasing = 0;
        }
    } else {
        ret.percentReleasing = 0;
        ret.percentHolding = 0;
        ret.percentPushing = 0;
    }
    return ret;
}

/**
 * Given a report, workout what should happen to the key.
 * @param  {Object} keyObj Directly from the report.tactile array
 * @return {Boolean} true to push AND HOLD the button, false to let go. null to do nothing.
 */
function tactileDecisionMaker(keyState, quorum) {
    var decision = {
        action: false,
        progress:0
    };

    decision.progress = Math.min(keyState.percentHolding,1);

    if(keyState.percentHolding >= 0.5) {
        decision.action = true;
    }
    if(keyState.percentReleasing >= 0.5) {
        decision.action = false;
    }

    return decision;
}

function createProgressForKey(keyObj,result) {
    if (keyObj === undefined || !keyObj.id === undefined) {
        console.log('Cannot create progress event for invalid key');
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

function createState(keyName) {
    return state.tactiles[keyName] = {
        action: false,
        code:keycode(keyName),
        name:keyName,
        percentHolding:0,
        percentPushing:0,
        percentReleasing:0
    }
}


function getStateForKey(keyName) {
    if(state.tactiles[keyName]){
        return state.tactiles[keyName];
    }
    return createState(keyName);
}

/**
 * Workout for each key if it should be pushed or unpushed according to the report.
 * @param {[type]} keyObj [description]
 */
function updateKey(users,keyObj) {

    //Pull the code from our map of ids -> codes
    keyObj.code = getKeyCodeForID(keyObj.id);

    //get rid of incorrectly created keys
    if(!keyObj.code) {
        console.warn('No keycode for ' + keyObj.id);
        return;
    }

    keyObj.original = keyObj.code;
    keyObj.name= keycode(keyObj.original);

    //Remappa if enabled
    if(config.remap) {
        keyObj.code = remapKey(keyObj.code);
    }
    var keyState = updateState(keyObj,users.quorum);
    var decision = tactileDecisionMaker(keyState, users.active);
    if(decision !== null && decision.action !== null) {
        if(keyState.action !== decision.action) {
            setKey(keyObj.name, decision.action);
            keyState.action = decision.action;
            if(widgets) {
                widgets(state);
            }
            return createProgressForKey(keyObj, decision);
        }
        var ret;
        if(decision.progress !== keyState.progress || keyState.action !== decision.action) {
            ret = createProgressForKey(keyObj, decision);
        }
        keyState.progress = decision.progress;
        return ret;
    }
}

function handleTactile(tactile, users) {
    if(!tactile) {
        return;
    }
    var progress = tactile.map(updateKey.bind(this,users));

    //Remove undefineds from map
    progress = progress.filter(function(progress){
        return progress !== undefined;
    });

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
 * @todo This is a mess and is only used in one place, setKeys should go back
 * to its roots and just set each key in the input array to false. 
 * Right now it only takes IDs
 */
function setKeys(keyIds, status, remap) {
    var progressArray = [];
    keyIds.forEach(function(value) {
        progressArray.push(createProgressForKey({id:value}, {action:status, progress:(status) ? 1 : 0}));
    });
    if(robot !== null) {
        var args = {
            joystick:[],
            tactile: progressArray
        };
        robot.send(new Packets.ProgressUpdate(args));
    }

    keyNames = keys.map(function(keyName){
        return keycode(getKeyCodeForID(keyName));
    });
    if(remap) {
        keyNames = keyNames.map(remapKey);
    }

    keysNames.forEach(function(keyName) {
        var keyState = getStateForKey(keyName);
        keyState.action = false;
        keyState.progress = 0;
        setKey(keyName,status);
    });
    widgets(state);
}
/**
 * Given a key name set it to the apropriate status
 * @param {String} keyName The key name, "W" and not 87
 * @param {Boolean} status  true to push the key, false to release
 */
function setKey(keyName,status) {
    //Beam reports back keycodes, convert them to keynames, which our handlers accept
    if(typeof keyName === 'number') {
        console.log('warning setting by number');
        keyName = keycode(keyName);
    }

    //Something in remapping or handling sometimes makes this undefined
    //It causes an error to proceed so we'll stop here
    if(!keyName) {
        return;
    }

    if(status) {
        controls.press(keyName.toUpperCase());
    } else {
        controls.release(keyName.toUpperCase());
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
function getIDForKeyCode(keyCode) {
    return Object.keys(map).find(function(id){
        return map[id] === keyCode;
    })
}

function status(msg) {
    var now = new Date().toLocaleString();
    state.status = now + ' ' + msg;
    widgets(state);
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
        if(controls && controls.length) {
            controls.forEach(function(tactile) {
                if(tactile.key) {
                    map[tactile.id] = tactile.key;
                    createState(keycode(tactile.key));
                }
            });
        } else {
            throw new Error('Incorrect version id or share code in your config or no control layout saved for that version.');
        }
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
                clear();
            }
        });
        robot.on('report',handleReport);
    }).catch(function(err){
        if(err.message !== undefined && err.message.body !== undefined) {
            err = err.message.body;
        } else {
            throw err;
        }
        console.log(err);
    });
}

setup();
