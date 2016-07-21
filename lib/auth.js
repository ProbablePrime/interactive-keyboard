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
}

function password(config, beam) {
	console.warn('Consider using an Implicit OAuth Token for security');
	return beam.use('password', {
		username: config.beam.username,
		password: config.beam.password
	}).attempt();
}
