var CLI = require('clui');
var  clc = require('cli-color');
module.exports = function(input) {
	return new CLI.Line()
		.column('QGram', 20, [clc.cyan])
		.column(CLI.Sparkline(input, ''), 80)
		.fill()
}
