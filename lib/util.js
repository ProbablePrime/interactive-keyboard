module.exports = {
	/**
	 * Convert a null value to a zero value. Protobuf loves sendings nulls
	 * @param  {Number} value A nullable value
	 * @return {Number} 0 or the original value
	 */
	nullToZero: function (value) {
		if (value === null) {
			return 0;
		}
		return value;
	},
	/**
	 * Calculate a decimalized percentage of a value
	 * @param  {Number} value 
	 * @param  {Number} total
	 * @return {Number}
	 */
	percentage: function (value, total) {
		if(total <= 0 || value <= 0) {
			return 0;
		}
		//ABS because negative values do weird things to progress bars
		return Math.abs(value / total);
	},
	convertToArray: function (obj) {
		if (!obj) {
			return [];
		}
		return Object.keys(obj).map(function (key) {
			return obj[key];
		});
	},
	normalizeJoyStick: function(obj) {
		var defaultJoyStick = {
			X: 0,
			Y: 0
		};
		return Object.assign({},defaultJoyStick,obj);
	},
	/**
	 * For a given action, Supply how many people are participating in the action
	 * and the total number of people active on the controls and recieve the percentage
	 * Focus of the users
	 * @param  {[type]} participating [description]
	 * @param  {[type]} total         [description]
	 * @return {[type]}               [description]
	 */
	calculateFocus: function (participating, total) {
		if (participating === 0 || total === 0) {
			return 0;
		}
		return total / participating;
	},
	noop: function() {}
};
