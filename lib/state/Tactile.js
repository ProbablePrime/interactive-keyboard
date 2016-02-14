var keycode = require("keycode");

var util = require('../util');

function Tactile(tactileControl) {
    this.control = tactileControl;
    this.id = this.control.id;
    this.code = this.control.key;
    this.name = keycode(this.control.key);
    this.label = this.control.label || '';
    this.clear();
}

Tactile.prototype.clear = function() {
    this.percentHolding = 0;
    this.percentPushing = 0;
    this.percentReleasing = 0;
    this.pressFrequency = 0;
    this.releaseFrequency = 0;
    this.holding = 0;
    this.action = false;
}

Tactile.prototype.update = function(tactileInfo, users) {
    //Frequencies/Numeric data
    this.pressFrequency = util.nullToZero(tactileInfo.pressFrequency);
    this.releaseFrequency = util.nullToZero(tactileInfo.releaseFrequency);
    this.holding = util.nullToZero(tactileInfo.holding);

    //Percentages
    this.percentHolding = util.percentage(tactileInfo.holding, users.quorum);
    this.percentPushing = util.percentage(tactileInfo.pressFrequency, users.quorum);
    this.percentReleasing = util.percentage(tactileInfo.releaseFrequency, users.quorum);
}


module.exports = Tactile;
