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

errors.ConfusingAuthError =
	class ConfusingAuthError extends errors.BeamKeyboardError {
		constructor() {
			super('Use password OR OAuth Token, not both. That is very confusing');
		}
	};

errors.AuthError =
	class AuthError extends errors.BeamKeyboardError {};

errors.JSONValidationError =
	class JSONValidationError extends errors.BeamKeyboardError {
		constructor() {
			super('Your config file is incorrectly formatted. It must be valid JSON');
		}
	};
