'use sctrict';
const robot = require('robot-js');
const window = robot.Window;
module.exports.getWindowInfo = function (title) {
	const list = window.getList(title);
	if (!list.length) {
		return;
	}
	const result = {};
	const target = list[0];
	const bounds = target.getBounds();
	result.x = bounds.x;
	result.y = bounds.y;
	result.height = bounds.h;
	result.width = bounds.w;
	result.title = target.getTitle();

	return result;
};
