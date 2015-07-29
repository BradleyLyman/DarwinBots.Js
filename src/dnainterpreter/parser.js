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
 * Returns the number if it is valid, else returns 0.
 **/
var _validateNumber = function(val) {
  return typeof val === "number" && isFinite(val) ? val : 0;
};

/**
 * Adds two validated numbers.
 **/
var _add = function(a, b) {
  return _validateNumber(a) + _validateNumber(b);
};

/**
 * Subtracts two validated numbers. (a - b)
 **/
var _sub = function(a, b) {
  return _validateNumber(a) - _validateNumber(b);
};

/**
 * Multiples two validated numbers. (a * b)
 **/
var _mult = function(a, b) {
  return _validateNumber(a) * _validateNumber(b);
};

/**
 * Divides two validated numbers. (a / b);
 **/
var _div = function(a, b) {
  return Math.round(_validateNumber(
    _validateNumber(a) / _validateNumber(b)
  ));
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
  },

  /**
   * Parses the token's value for an operator.
   * Returns:
   *   Result object, if an error is present then parsing failed.
   *   Otherwise result will be a function which applies the operation
   *   and returns some value.
   **/
  parseOperation : function(token) {
    if (token.value === "add") {
      return _createSuccess(_add);
    }

    if (token.value === "sub") {
      return _createSuccess(_sub);
    }

    if (token.value === "mult") {
      return _createSuccess(_mult);
    }

    if (token.value === "div") {
      return _createSuccess(_div);
    }

    return _createError(token);
  }
};







