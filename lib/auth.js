const Promise = require('bluebird');
module.exports = function (config, beam) {
	if (config.token) {
		return oAuth(config, beam);
	}
	return password(config, beam);
};

function oAuth(config, beam) {
	beam.use('oauth', {
		tokens: {
			access: config.token,
			expires: Date.now() + 365 * 24 * 60 * 60 * 1000
		}
	});
	return Promise.resolve();
}

function password(config, beam) {
	console.warn('Consider using an Implicit OAuth Token for security, tetris:robot:self and channel:update:self scopes are required');
	return beam.use('password', {
		username: config.username,
		password: config.password
	}).attempt();
}
