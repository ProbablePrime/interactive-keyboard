var Tactile = require('./Tactile');
var equal = require('deep-equal');
var keycode = require('keycode');
function State(controls) {
    this.tactiles = {};
    this.joysticks = {};
    this.qgram = [];
    this.status = '';
    this.controlState = 'default';
    controls.tactiles.forEach(this.createTactile.bind(this));
    console.log(this.tactiles);
}

State.prototype.update = function(report) {
    if(!equal(report.users.qgram, this.qgram)) {
        this.qgram = report.users.qgram;
    }
    if(report.tactile.length) {
        this.updateTactiles(report.tactile, report.users);
    }
};

State.prototype.updateTactiles = function(tactileInfos, users) {
    var self = this;
    tactileInfos.forEach(function(tactileInfo) {
        var tactile = self.getTactileById(tactileInfo.id);
        if (tactile) {
            tactile.update(tactileInfo,users);
        }
    });
}

State.prototype.addTactile = function() {
};

State.prototype.removeTactile = function() {
};

State.prototype.updateTactile = function() {

}



State.prototype.createTactile = function(tactileControl) {
    var tactile = new Tactile(tactileControl);
    this.tactiles[tactile.name] = tactile;
    return tactile;
}

State.prototype.getTactile = function(keyName) {  
    if(this.tactiles[keyName]){
        return state.tactiles[keyName];
    }
    return this.createTactile(keyName);
}

State.prototype.getTactileByLabel = function(label) {
    var self = this;
    var target;
    label = label.toLowerCase();
    Object.keys(self.tactiles).forEach(function(key) {
        var tactile = self.tactiles[key];
        if (tactile.label.toLowerCase() === label) {
            target = tactile;
        }
    });
    return target;
};

State.prototype.getTactileById = function(id) {
    var self = this;
    var target;
    Object.keys(self.tactiles).forEach(function(key) {
        var tactile = self.tactiles[key];
        if (tactile.id === id) {
            target = tactile;
        }
    });
    return target;
}

State.prototype.setStatus = function(msg) {
    var now = new Date().toLocaleString();
    state.status = now + ' ' + msg;
}

module.exports = State;
