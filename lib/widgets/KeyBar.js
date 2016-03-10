var CLI = require('clui');
var clc = require('cli-color');
var gauge = CLI.Gauge;
var Line = CLI.Line;

module.exports = function (tactile, max) {
	if (!tactile) {
		return new Line();
	}
	return new Line()
		.padding(2)
		.column(tactile.label + ' (' + tactile.name.toUpperCase() + ')', 15, [clc.cyan])
		.column(gauge(tactile.percentHolding * 100, max, 20, 60), 25)
		.column(gauge(tactile.percentReleasing * 100, max, 20, 60), 25)
		.column((tactile.action) ? '▼' : '▲', 2, [(tactile.action) ? clc.green : clc.red])
		.fill();
};
