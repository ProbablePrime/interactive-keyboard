'use strict';
const windoze = require('windoze');

module.exports.getWindowInfo = function (title) {
	const details = windoze.getWindowDetailsByTitle(title, true);
	if (!details) {
		throw new Error(`Cannot find window: ${title}`);
	}
	return details;
};
