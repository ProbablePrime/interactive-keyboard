var QGram = require('./QGram');
var KeyBar = require('./Keybar');

var CLI = require('clui'),
    clc = require('cli-color'),
    Line = CLI.Line;
    LineBuffer = CLI.LineBuffer;

function flattenQGram(qgram) {
	//replace qgram with just its value
	var flattened = qgram.map(function(qgram){
		return qgram.users;
	});
	if(flattened.length < 5) {
		while(flattened.length < 5) {
			flattened.push(0);
		}
	}
	return flattened;
}
module.exports = function(state) {
	//console.log(clc.reset);

	var blankLine = new Line().fill().output();
	var base = new LineBuffer();
	base.addLine(QGram(flattenQGram(state.qgram)));
	Object.keys(state.tactiles).forEach(function(key) {
		var tactile = state.tactiles[key];
		base.addLine(KeyBar(tactile, 100, tactile.name));
	});
	var now = new Date().toLocaleString();
	base.addLine(new Line().column('Last Input:' + now,50).fill());
	base.output();
}
