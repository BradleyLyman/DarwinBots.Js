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

/**
 * Parses the token's value for the integer it represents.
 * Returns:
 *   Result object, if an error is present then parsing failed,
 *   otherwise result will be a function which returts the number's
 *   value.
 *   function() { return number; }
 **/
var parseNumber = function(token) {
  var number = parseInt(token.value, 10);
  if (isNaN(number)) {
    return _createError(token);
  }

  return _createSuccess(function() {
    return number;
  });
};

/**
 * Parses the token's value for a sysvar's value.
 * Returns:
 *   Result object, if an error is present then parsing failed.
 *   Otherwise result will be a function which return's the sysvar's
 *   value.
 *   function(sysvars) { return sysvar; }
 **/
var parseSysvar = function(token) {
  var addr = 0;

  if (token.value[0] !== "*" || token.value[1] !== ".") {
    return _createError(token);
  }

  addr = token.value.slice(2);

  return _createSuccess(function(sysvars) {
    return sysvars[addr] || 0;
  });
};

/**
 * Parses the token's value for a sysvar's name.
 * Returns:
 *   Result object, if an error is present then parsing failed.
 *   Otherwise result will be a function which returns the sysvar's
 *   value.
 *   function() { return name; }
 **/
var parseSysvarAddr = function(token) {
  var addr;

  if (token.value[0] !== ".") {
    return _createError(token);
  }

  addr = token.value.slice(1);

  return _createSuccess(function() {
    return addr;
  });
};

/**
 * Parses the token as a sysvar, a sysvar address,
 * or as a numeric literal. Returns error on failure.
 **/
var parseValue = function(token) {
  var cmd = parseSysvarAddr(token);

  if (cmd.error === null) {
    return _createSuccess(cmd.result);
  }

  cmd = parseSysvar(token);

  if (cmd.error === null) {
    return _createSuccess(cmd.result);
  }

  cmd = parseNumber(token);

  if (cmd.error === null) {
    return _createSuccess(cmd.result);
  }

  return _createError(token);
};

/**
 * Parses the token's value for an operator.
 * Returns:
 *   Result object, if an error is present then parsing failed.
 *   Otherwise result will be a function which applies the operation
 *   and returns some value.
 **/
var parseOperation = function(token) {
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
};

/* forward declaration */
var parseExpression = function() { return; };

/**
 * Parses the token stack assuming the next token is a value.
 * If the assumption is false then the token will be parsed
 * as an expression.
 * Return:
 *   If parsing fails then an error will be returned, otherwise
 *   the object will have the updated stack and the result function.
 *   { error : {}, result : fn, tokens : tokenStack }
 **/
var parseStatement = function(tokenStack) {
  var token       = tokenStack.peek(),
      valueResult = parseValue(token),
      retVal      = {};

  if (valueResult.error !== null) {
    return parseExpression(tokenStack);
  }

  retVal        = _createSuccess(valueResult.result);
  retVal.tokens = tokenStack.shift();

  return retVal;
};

/**
 * Parses a stack of tokens, consuming each one in turn,
 * until a complete statement is built or an error
 * occurs.
 * Returns:
 *   If an error exists then parsing failed, otherwise
 *   result is the function which executes the expression
 *   and the updated tokenStack is called stack.
 *   { error : null, reult : fn, tokens : tokenStack }
 **/
parseExpression = function(tokenStack) {
  var currentToken   = tokenStack.peek(),
      operation      = parseOperation(currentToken),
      operationCmd,
      stackA, resultA, cmdA,
      stackB, resultB, cmdB,
      finalResult;

  // failure to parse the operation is fatal
  if (operation.error !== null) {
    return _createError(operation.error);
  }
  operationCmd = operation.result;

  resultA = parseStatement(tokenStack.shift());
  if (resultA.error !== null) {
    return _createError(operation.error);
  }
  stackA = resultA.tokens;
  cmdA   = resultA.result;

  resultB = parseStatement(stackA);
  if (resultB.error !== null) {
    return _createError(operation.error);
  }
  stackB = resultB.tokens;
  cmdB   = resultB.result;

  finalResult = _createSuccess(function(sysvars) {
    var b = cmdB(sysvars);
    var a = cmdA(sysvars);
    return operationCmd(b, a, sysvars);
  });
  finalResult.tokens = stackB;

  return finalResult;
};

module.exports = {
  parseNumber     : parseNumber,
  parseOperation  : parseOperation,
  parseSysvar     : parseSysvar,
  parseSysvarAddr : parseSysvarAddr,
  parseExpression : parseExpression
};







