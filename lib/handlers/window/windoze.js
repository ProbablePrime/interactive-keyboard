var windoze = require('windoze');

module.exports.getWindowInfo = function (title) {
	return windoze.getWindowDetailsByTitle(title, true);
};
