var os   = require('os'),
    CLI = require('clui'),
    clc = require('cli-color');
var Gauge = CLI.Gauge;
var Line = CLI.Line;

module.exports = function(tactile,max,label) {
	if(!label) {
		console.log(tactile);
		return new Line();
	}
	return new Line()
		.padding(2)
		.column(label.toUpperCase(), 20, [clc.cyan])
		.column(Gauge(tactile.percentHolding * 100, max, 20, 60), 25)
		.column((tactile.action) ? '▼':'▲', 2, [(tactile.action) ? clc.green : clc.red])
		.fill();
}