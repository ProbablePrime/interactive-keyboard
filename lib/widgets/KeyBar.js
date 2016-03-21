'use strict';
const CLI = require('clui');
const clc = require('cli-color');
const gauge = CLI.Gauge;
const Line = CLI.Line;

module.exports = function (tactile, max) {
	if (!tactile) {
		return new Line();
	}
	let name = tactile.label;
	if (tactile.name) {
		name += ` (${tactile.name.toUpperCase()})`;
	}
	return new Line()
		.padding(2)
		.column(name, 15, [clc.cyan])
		.column(gauge(tactile.percentHolding * 100, max, 20, 60), 25)
		.column(gauge(tactile.percentReleasing * 100, max, 20, 60), 25)
		.column((tactile.action) ? '▼' : '▲', 2, [(tactile.action) ? clc.green : clc.red])
		.fill();
};
