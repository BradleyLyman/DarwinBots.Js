/**
 * Create an error object.
 * Returns:
 *   Object with the error value set to payload.
 **/
var _createError = function(payload) {
  return { error : payload };
};

/**
 * Creates a success object.
 * Returns:
 *   Object with error set to null and result set to payload.
 **/
var _createSuccess = function(payload) {
  return { error : null, result : payload };
};

/**
 * Public API
 **/

module.exports = {
  /**
   * Parses the token's value for the integer it represents.
   * Returns:
   *   Result object, if an error is present then parsing failed,
   *   otherwise result will be a function which returts the number's
   *   value.
   *   function() { return number; }
   **/
  parseNumber : function(token) {
    var number = parseInt(token.value, 10);
    if (isNaN(number)) {
      return _createError(token);
    }

    return _createSuccess(function() {
      return number;
    });
  },

};







