module.exports = {
    /**
     * Convert a null value to a zero value. Protobuf loves sendings nulls
     * @param  {Number} value A nullable value
     * @return {Number} 0 or the original value
     */
    nullToZero: function(value) {
        if(value === null) {
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
    percentage: function(value,total) {
        if(total <= 0 || value <= 0) {
            return 0;
        }
        //ABS because negative values do weird things to progress bars
        return Math.abs(value / total);
    },
    convertToArray: function(obj) {
        return Object.keys(obj).map(function(key){
            return obj[key];
        });
    }
}
