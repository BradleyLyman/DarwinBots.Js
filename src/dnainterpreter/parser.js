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

  /**
   * Parses the token's value for a sysvar's value.
   * Returns:
   *   Result object, if an error is present then parsing failed.
   *   Otherwise result will be a function which return's the sysvar's
   *   value.
   *   function(sysvars) { return sysvar; }
   **/
  parseSysvar : function(token) {
    var addr = 0;

    if (token.value[0] !== "*" || token.value[1] !== ".") {
      return _createError(token);
    }

    addr = token.value.slice(2);

    return _createSuccess(function(sysvars) {
      return sysvars[addr] || 0;
    });
  },

  /**
   * Parses the token's value for a sysvar's name.
   * Returns:
   *   Result object, if an error is present then parsing failed.
   *   Otherwise result will be a function which returns the sysvar's
   *   value.
   *   function() { return name; }
   **/
  parseSysvarAddr : function(token) {
    var addr;

    if (token.value[0] !== ".") {
      return _createError(token);
    }

    addr = token.value.slice(1);

    return _createSuccess(function() {
      return addr;
    });
  }
};







