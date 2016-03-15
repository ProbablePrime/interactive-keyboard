function JoyStick(JoyStickControl) {
	this.control = JoyStickControl;
	this.id = this.control.id;
	this.code = this.control.key;
	this.label = this.control.text || '';
	this.clear();
}

JoyStick.prototype.clear = function () {
	this.coordMean = {};
	this.coordStddev = {};
};
module.exports = JoyStick;
