const CLI = require('clui');
const clc = require('cli-color');
module.exports = function (input) {
	/* eslint-disable babel/new-cap */
	return new CLI.Line()
		.padding(2)
		.column('QGram', 20, [clc.cyan])
		.column(CLI.Sparkline(input, ''), 80)
		.fill();
	/* eslint-enable babel/new-cap */
};
