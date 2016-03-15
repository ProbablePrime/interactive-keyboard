var qGram = require('./QGram');
var keyBar = require('./KeyBar');
var util = require('../util')

var CLI = require('clui');
var Line = CLI.Line;
var LineBuffer = CLI.LineBuffer;

function flattenQGram(qgram) {
	// replace qgram with just its value
	var flattened = qgram.map((qgram) => qgram.users);
	if (flattened.length < 5) {
		while (flattened.length < 5) {
			flattened.push(0);
		}
	}
	return flattened;
}
module.exports = function (report) {
	var blankLine = new Line().fill().output();
	var base = new LineBuffer();
	base.addLine(blankLine);
	base.addLine(qGram(flattenQGram(report.users.qgram)));
	base.addLine(blankLine);
	var labels = new Line()
	.padding(2)
	.column('Key', 20)
	.column('Holding %', 27)
	.column('Releasing %', 27);
	base.addLine(labels);
	util.convertToArray(report.tactile).forEach((tactile) => {
		base.addLine(keyBar(tactile, 100));
	});
	var now = new Date().toLocaleString();
	base.addLine(new Line().padding(2).column('Last Control Update:' + now, 50).fill());
	base.addLine(blankLine);
	base.output();
};
