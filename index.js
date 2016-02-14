var Beam = require('beam-client-node');
var Tetris = require('beam-interactive-node');

var State = require('./lib/state/State');
var ControlsProcessor = require('./lib/ControlsProcessor');
var Config = require('./lib/Config');
var Packets = require('beam-interactive-node/dist/robot/packets');

var config;
var processor;
var state;

var clear = require('clear');

//Transforms codes(65) into key names(A) and visa versa
var keycode = require('keycode');

var args = process.argv.slice(2);
var file = args[0];
var config = new Config(file);
//50% of users must be voting on an action for it to happe
var widgets;

if(config.widgets) {
    widgets = require('./lib/widgets');
} else {
    widgets = function() {};
}
processor = new ControlsProcessor(config);



//var controls = require('./lib/handlers/'+config.handler+'.js');
var beam = new Beam();
var robot = null;

/**
 * Our report handler, entry point for data from beam
 * @param  {Object} report Follows the format specified in the latest tetris.proto file
 */
function handleReport(report) {
    state.update(report);
    var progress = processor.process(state);
    if(robot !== null) {
        if(progress.tactile.length !== 0 || progress.joystick.length !== 0) {
            robot.send(new Packets.ProgressUpdate(progress));
        }
    }
    if(!report.tactile.length && report.users.quorum == 0) {
        //I don't like this, need to refactor this if it fixes stuck keys
        var touchedAKey = false;
        Object.keys(state.tactiles)
        .forEach(function(key){
            var tactile = state.tactiles[key];
            if(tactile.action) {
                tactile.clear();
                setKey(tactile.name,false);
            }
        });
    }
}

//clear the keys on exit?? Ctrl+C doesn't appear to send this event
process.on('exit', function() {
    console.log('clearing your keys');
    //clearKeys();
});
process.on('SIGINT', function() {
    console.log('clearing your keys');
    //clearKeys();
    process.exit();
});

function shouldDisplay(keyObj) {
    if(keyObj.pressFrequency !== null || keyObj.releaseFrequency !== null) {
        return keyObj.pressFrequency !== 0 || keyObj.releaseFrequency !== 0;
    }
    return false;
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

function validateControls(controls) {
    if (!controls.tactiles || controls.tactiles.length == 0) {
        throw new Error("No buttons defined, please define some buttons in the beam lab");
    }
    var analysis = controls.tactiles.every(function(tactile) {
        return (tactile.analysis.holding && tactile.analysis.frequency);
    });
    if (!analysis) {
        throw new Error("Buttons require holding and frequency to be checked for analysis");
    }

    var keyCodes = controls.tactiles.every(function(tactile){
        return (tactile.key != null && tactile.key >= 8 && tactile.key < 300);
    });
    if(!keyCodes) {
        throw new Error("Some invalid keycodes were found in your beam controls. Check them at keycode.info");
    }
    return controls;
}

function getControls(channelID) {
    return beam.request('GET','tetris/'+channelID)
    .then(function(res) {
        return res.body.version.controls;
    },function() {
       throw new Error('Incorrect version id or share code in your config or no control layout saved for that version.');
    });
}

function createState(controls) {
    return new State(controls);
}

function validateConfig() {
     if(!config) {
        throw new Error('Missing config file cannot proceed, Please create a config file. Check the readme for help!');
    }
    if(!config.version || !config.code) {
        throw new Error('Missing version id and share code. These are required for now');
    }
    var needed = ["channel","password","username"];
    console.log(config.beam);
    needed.forEach(function(value){
        if(!config.beam[value]) {
            throw new Error("Missing "+value+ " in your config file. Please add it to the file. Check the readme if you are unsure!");
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
            throw new Error('Invalid channel specified in config file, or no channel found on beam');
        })
    }
}

function go(id) {
    beam.use('password', {
        username: config.beam.username,
        password: config.beam.password
    }).attempt()
    .then(function(){
        return goInteractive(config.version, config.code);
    }).then(function() {
        return getControls(channelID);
    }).then(function(controls) {
        return validateControls(controls);
    }).then(function(controls) {
        state = createState(controls);
        return state;
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
                console.log('Theres a problem connecting to tetris');
                console.log(err);
            } else {
                console.log('Connected to Tetris');
                //clear();
            }
        });
        robot.on('report',handleReport);
    }).catch(function(err) {
        widgets = function() {};
        if(err.message !== undefined && err.message.body !== undefined) {
           console.log(err);
        } else {
            throw err;
        }
    });
}

setup();
