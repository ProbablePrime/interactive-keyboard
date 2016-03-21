const keycode = require('keycode');

function Tactile(tactileControl) {
	this.control = tactileControl;
	this.cooldown = tactileControl.cooldown.press || 0;
	this.id = this.control.id;
	this.code = this.control.key;
	this.name = keycode(this.control.key);
	this.label = this.control.text || '';
	this.clear();
}

Tactile.prototype.clear = function () {
	this.percentHolding = 0;
	this.percentPushing = 0;
	this.percentReleasing = 0;
	this.pressFrequency = 0;
	this.releaseFrequency = 0;
	this.holding = 0;
	this.action = false;
};

Tactile.prototype.isMouseClick = function () {
	return this.code === 0 && this.label.toLowerCase().search('click') !== -1;
};

module.exports = Tactile;
