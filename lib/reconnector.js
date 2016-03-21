'use strict';
let attempts = 1;

function generateInterval(attempts) {
	return Math.min(30, (Math.pow(2, attempts) - 1)) * 1000;
}

module.exports = function (obj, reconnectMethod, callback) {
	if (!reconnectMethod) {
		reconnectMethod = 'handshake';
	}
	if (!callback) {
		callback = function () {};
	}
	obj.on('close', () => {
		console.log('close detected');
		setTimeout(() => {
			console.log('retrying');
			attempts += 1;
			obj[reconnectMethod](callback);
		}, generateInterval(attempts));
	});
	obj.on('connect', () => {
		attempts = 1;
	});
};
