var util = require('../util');

function JoyStick(JoyStickControl) {
    this.control = JoyStickControl;
    this.id = this.control.id;
    this.code = this.control.key;
    this.label = this.control.text || '';
    this.clear();
}

JoyStick.prototype.clear = function () {
    this.coordMean = util.normalizeJoyStickData();
    this.coordStddev = util.normalizeJoyStickData();
};

JoyStick.prototype.update = function (JoyStickInfo, users) {
    this.coordMean = util.normalizeJoyStickData(JoyStickInfo.coordMean);
    this.coordStddev = util.normalizeJoyStickData(JoyStick.coordStddev);
};

module.exports = JoyStick;
