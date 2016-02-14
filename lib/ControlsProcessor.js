var keycode = require('keycode');
var util = require('./util');
var Packets = require('beam-interactive-node/dist/robot/packets');

function ControlsProcessor(config) {
    this.handler = require('./handlers/' + config.handler);
    this.metric = require('./metrics/' + config.metric);
    this.config = config;
}


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

/**
 * Given a Key name "W" or a keycode 87 transform that key using the
 * remapping table from the config.
 * @param  {Number|String} code
 * @return {String} the keyname of the remapped key
 */
ControlsProcessor.prototype.remapKey = function() {
    var stringCode;
    if(typeof code === 'number') {
        stringCode = keycode(code).toUpperCase();
    } else {
        stringCode = code;
    }

     if(remap[stringCode]) {
        return config.remap[stringCode].toLowerCase();
    }
    return code;
};

ControlsProcessor.prototype.clearAllKeys = function() {
    this.setKeys(Object.keys(map), false, config.remap);
}

ControlsProcessor.prototype.process = function(state) {
    var tactileResult = util.convertToArray(state.tactiles).map(this.processTactile.bind(this,state,state.users));
    tactileResult = tactileResult.filter(function(tactileProgress){
        return tactileProgress !== undefined;
    });

    return {
        tactile: tactileResult,
        joystick:[],
        state: state.controlState
    }
}

ControlsProcessor.prototype.processTactile = function(state, users, tactileState) {
    var decision = this.metric(tactileState, users, this.config);
    decision = this.checkBlocks(tactileState, decision, state);
    if(decision !== null && decision.action !== null) {
        if(tactileState.action !== decision.action) {
            this.setKey(tactileState.name, decision.action);
            tactileState.action = decision.action;
        }
        var ret;
        if(decision.progress !== tactileState.progress || tactileState.action !== decision.action) {
            ret = this.createProgressForKey(tactileState, decision);
        }
        tactileState.progress = decision.progress;
        return ret;
    }
}

/**
 * Given a tactile state, an in progress decision and a set of 2 paired keys
 * Block the current key from being pushed if its paired key is down.
 * @param  {Object} keyState State to check
 * @param  {Object} decision Decision in progress
 * @param  {String} a        The first key in the pair, the one to block
 * @param  {String} b        The second key in the pair, the one to check for
 * @return {Object}          The updated decision
 */
ControlsProcessor.prototype.checkBlock = function(stateA,stateB,decision) {
    if(stateB && stateB.action) {
        decision.action = false;
        decision.progress = 0;
    }
    return decision;
}

/**
 * Give a tactile state loop through the blocks as defined in the config, 
 * working out if this current decision should be blocked
 * @param  {Object} keyState State to check
 * @param  {Object} decision Current decision in progress
 * @return {Object}
 */
ControlsProcessor.prototype.checkBlocks = function(keyState,decision,state) {
    var self = this;
    Object.keys(self.config.blocks).forEach(function(blockA) {
        if(keyState.label.toLowerCase() !== blockA.toLowerCase()) {
            return;
        }
        decision = self.checkBlock(keyState, state.getTactileByLabel(self.config.blocks[blockA]), decision);
    });
    return decision;
}
/**
 * Given a key name set it to the apropriate status
 * @param {String} keyName The key name, "W" and not 87
 * @param {Boolean} status  true to push the key, false to release
 */
ControlsProcessor.prototype.setKey = function(keyName,status) {
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
        this.handler.press(keyName.toUpperCase());
    } else {
        this.handler.release(keyName.toUpperCase());
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

    keyNames = keyIds.map(function(keyName){
        return keycode(getKeyCodeForID(keyName));
    });
    if(remap) {
        keyNames = keyNames.map(remapKey);
    }

    keyNames.forEach(function(keyName) {
        var keyState = getStateForKey(keyName);
        keyState.action = false;
        keyState.progress = 0;
        setKey(keyName,status);
    });
    widgets(state);
}

function handleTactile() {
    var progress = states.map(updateKey.bind(this,users));
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
        //robot.send(new Packets.ProgressUpdate(args));
    }
}

/**
 * Given a tactile from a Tetris report, generate a ProgressUpdate packet
 * to be sent back to Tetris
 * @param  {Object} keyObj The tactile from the report
 * @param  {Object} result The decision from the decision maker process
 * @return {Object}        The tactile progress update to be sent back to tetris
 */
ControlsProcessor.prototype.createProgressForKey = function(keyObj,result) {
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


module.exports = ControlsProcessor;
