const Promise = require('bluebird');
const errors = require('./errors.js');

module.exports = function (config, beam) {
	if (config.password && config.token) {
		throw new errors.ConfusingAuthError();
	}

	if (config.token) {
		return oAuth(config, beam);
	}
	if (config.username && config.password) {
		return password(config, beam);
	}
	throw new errors.AuthError('Missing Authentication');
};

function oAuth(config, beam) {
	beam.use('oauth', {
		tokens: {
			access: config.token,
			expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
		}
	});
	return beam.request('GET', `users/current`).then(res=> res.body);
}

function password(config, beam) {
	console.warn('Consider using an OAuth Token for security, interactive:robot:self and channel:update:self scopes are required');
	return beam.use('password', config).attempt().then(res=> res.body);
}
