'use strict';
const errors = module.exports = {};

errors.BeamKeyboardError =
	class UserError extends Error {
		constructor(msg) {
			super(msg);
			this.name = this.constructor.name;
		}
	};

errors.AuthDataError =
	class AuthDataError extends errors.BeamKeyboardError {
		constructor() {
			super('Move your authentication data to auth.json');
		}
	};
