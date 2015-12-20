var Beam = require('beam-client-node');
var Tetris = require('beam-interactive-node');
var rjs = require('robotjs');
var keycode = require('keycode');

var config = require('./config/default.json');

var stream = parseInt(config.beam.channel,10);
var username = config.beam.username
var password = config.beam.password;

//50% of users must be pushing a button down for it to be pushed here
var tactileThreshold = config.beam.threshold;

var beam = new Beam();

beam.setUrl('api',config.api);
beam.setExtraRequestArguments({
    auth: config.auth
});
beam.use('password', {
    username: username,
    password: password
}).attempt().then(function () {
    return beam.game.join(stream);
}).then(function (details) {
    details = details.body;
    details.remote = details.address;
    details.channel = stream;
    var robot = new Tetris.Robot(details);
    robot.handshake(function(err){
        //This callback has to be here atm
        if(err) {
            throw err;
        } else {
            console.log('connected');
        }
    });

    robot.on('report',handleReport);
});

function handleReport(report) {
    //if no users are playing or there's a brief absence of activity
    //the reports contain no data in the arrays. So we detect if there's data
    //before attempting to process it
    if(report.joystick.length) {
        handleJoyStick(report.joystick);
    }

    if(report.tactile.length) {
        handleTactile(report.tactile);
    }
}

//My onscreen controls are WASD for firing and the joystick for walking. They felt more natural for me
//as a viewer as the joystick screams movement. But we can't send WASD because that will double our movement inputs
//
//So heres a small mapping table that redirects incoming wasd to the arrow keys
var remap = {
    87:38,
    83:40,
    64:37,
    68:39
}

function setKeyState(keyObj) {
    if(remap[keyObj.code]) {
        keyObj.code = remap[keyObj.code];
    }
    //Sometimes the key object will be blank check for that here
    if(keyObj.down) {
        //If the down mean is >= to the threshold(50%) push the key down and leave it there
        if(keyObj.down.mean >= tactileThreshold) {
            setKey(keyObj.code, true);
        //else if the up mean is >= to the threshold(50%) release the key and leave it there
        } else if(keyObj.up.mean >= tactileThreshold) {
            setKey(keyObj.code,false);
        }
    }
}

function handleTactile(tactile) {
    tactile = tactile.forEach(setKeyState);
}


//Here we want to take the 2 Axis joystick data and convert it into keycodes.
function handleJoyStick(joystick) {
    //Start with a default of 0,0 because there might only be activity on one axis
    var coords = {x:0,y:0};

    //Joystick is an array of axises(axii?) that contain info from your control config
    //For isaac we collect the MEAN(Average) of the X and Y.
    //
    //This averages w all the users inputs into a value between -1 and 1. 
    //Where 1 is the positive side of each axis. For X this is d and for Y this
    //is w.
    //e.g.
    //For X:
    //  1 = d
    //  -1 = a
    //For Y:
    //  1 = w
    //  -1 = s
    joystick.forEach(
        function(stick) {
            if(!stick) {
                return;
            }
            //X is reported as axis 0, y is axis 1
            var axis = 'x';
            if(stick.axis !== 0) {
                axis = 'y';
            }
            coords[axis] = stick.info.mean;
        }
    );

    //Now we have two values x and y in their simplest form.
    //Ideally I'd like to output these values through some sort of gamepad emulator that acts
    //like a pad is connected but allows us to simulate inputs on it
    //
    //A brief look through NPM only found modules to read values from gamepads, we need to pretend
    //to be one and output the data.
    //
    //So instead we need to take these two coordinates and map them to keypresses.
    //
    //For ISAAC WASD is movement and the arrow keys are to fire. 
    //
    //To get this from the two values above we can use atan2 as x and y are actually a vector of how far away
    //the joystick is from 0,0
    //We convert this to degrees because radians make my head hurt
    var rotation = Math.atan2(coords.x,coords.y) * 180 / Math.PI;

    //Now we need to constrain that angle to the closest angle of a circle that represents a compas direction
    //
    //We need 8 way movement ISAAC can move diagonally.
    var division = 360 / 8;

    //Then we get the constrained angle
    var resolvedAngle = Math.round(rotation / division) * division;

    //As its relative to the centre we get negative angles when down or left are involved
    //so if we add 180 to the absolute value we get the other half of the circle, 180 - 360
    if(resolvedAngle < 0) {
        resolvedAngle = Math.abs(resolvedAngle) + 180;
    }
    //Treat 360 as 0 just for convinience
    if(resolvedAngle == 360) {
        resolvedAngle = 0;
    }

    //Now we have an angle between 0 and 360 that we can easily map to a compass direction.
    //90 - east
    //180 - south
    //45 - north east
    //
    //Substituting in wasd for NSEW we get:
    var table = {
        0:['w'],
        45:['w','d'],
        90:['d'],
        135:['d','s'],
        180:['s'],
        225:['s','a'],
        270:['a'],
        315:['w','a']
    }

    //Then to get a list of keys to push we simply access out table, I threw
    //a missing check around this just incase my maths borks but I haven't seen it do this
    var keysToPush = [];
    if(table[resolvedAngle]) {
        keysToPush = table[resolvedAngle];
    }

    //Unset WASD so they are up(false) so that we start with a blank slate
    setKeys(['w','a','s','d'], false);

    //Now set the retrieved keys to true(down)
    setKeys(keysToPush, true);

    //Done
}

function setKeys(keys,status) {
    keys.forEach(function(key) {
        setKey(key,status);
    });
}

function setKey(key,status) {
    //Tetris reports back keycodes, convert them to keynames, which robotjs accepts
    if(typeof key === 'number') {
        key = keycode(key);
    }
    console.log(key,status);
    //Robotjs wants 'down' or 'up', I prefer true or false
    //handle that here
    status = (status) ? 'down' : 'up';

    
    rjs.keyToggle(key, status)
}
