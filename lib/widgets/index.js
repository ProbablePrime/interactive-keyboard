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
	const tactileArray = util.convertToArray(report.tactile);
	const maxIdLength = Math.floor(Math.log10(Math.abs(tactileArray.length))) + 1;
	const blankLine = new Line().fill().output();
	const base = new LineBuffer();
	base.addLine(blankLine);
	base.addLine(qGram(flattenQGram(report.users.qgram)));
	base.addLine(blankLine);
	const labels = new Line()
	.padding(2)
	.column('ID', maxIdLength + 3)
	.column('Key', 20)
	.column('Holding %', 25)
	.column('Releasing %', 27);
	base.addLine(labels);
	tactileArray.sort(function(a, b) { return a.id - b.id; }).forEach(tactile => {
		base.addLine(keyBar(tactile, maxIdLength, 100));
	});
	const now = new Date().toLocaleString();
	base.addLine(new Line().padding(2).column(`Last Control Update:${now}`, 50).fill());
	base.addLine(blankLine);
	base.output();
};
