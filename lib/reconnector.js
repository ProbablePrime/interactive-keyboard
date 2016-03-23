'use strict';
let attempts = 1;

function generateInterval(attempts) {
	return Math.min(30, (Math.pow(2, attempts) - 1)) * 1000;
}

module.exports = function (obj, reconnectMethod) {
	obj.on('close', () => {
		const delay = generateInterval(attempts);
		console.log(`close detected retrying after ${delay}`);
		setTimeout(() => {
			console.log('retrying');
			attempts += 1;
			reconnectMethod();
		}, delay);
	});
	obj.on('connect', () => {
		attempts = 1;
	});
};
