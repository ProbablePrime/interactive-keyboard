'use strict';
const qGram = require('./QGram');
const keyBar = require('./KeyBar');
const util = require('../util');

const CLI = require('clui');
const Line = CLI.Line;
const LineBuffer = CLI.LineBuffer;

function flattenQGram(qgram) {
	// replace qgram with just its value
	const flattened = qgram.map(qgram => qgram.y);
	if (flattened.length < 5) {
		while (flattened.length < 5) {
			flattened.push(0);
		}
	}
	return flattened;
}
module.exports = function (report) {
	const blankLine = new Line().fill().output();
	const base = new LineBuffer();
	base.addLine(blankLine);
	base.addLine(qGram(flattenQGram(report.users.qgram)));
	base.addLine(blankLine);
	const labels = new Line()
	.padding(2)
	.column('Key', 20)
	.column('Holding %', 27)
	.column('Releasing %', 27);
	base.addLine(labels);
	util.convertToArray(report.tactile).forEach(tactile => {
		base.addLine(keyBar(tactile, 100));
	});
	const now = new Date().toLocaleString();
	base.addLine(new Line().padding(2).column(`Last Control Update:${now}`, 50).fill());
	base.addLine(blankLine);
	base.output();
};
