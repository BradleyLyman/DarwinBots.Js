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
 * Stores value a in sysvar with name b.
 * Returns value stored.
 **/
var _store = function(a, b, sysvars) {
  sysvars[b] = _validateNumber(a);
  return sysvars[b];
};

/**
 * Each binary op function compares the validated result
 * of the provided values and returns the result.
 **/

var _greater = function(a, b) {
  return _validateNumber(a) > _validateNumber(b);
};

var _less = function(a, b) {
  return _validateNumber(a) < _validateNumber(b);
};

var _equal = function(a, b) {
  return _validateNumber(a) === _validateNumber(b);
};

var _notEqual = function(a, b) {
  return _validateNumber(a) !== _validateNumber(b);
};

var _greaterOrEqual = function(a, b) {
  return _validateNumber(a) >= _validateNumber(b);
};

var _lessOrEqual = function(a, b) {
  return _validateNumber(a) <= _validateNumber(b);
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

  if (token.value === "store") {
    return _createSuccess(_store);
  }

  return _createError(token);
};

/**
 * Parses the token's value as a boolean operation.
 * Returns:
 *   If parsing failed then the token will be returned as an error,
 *   otherwise a result object will be returned with a function
 *   which executes the operation.
 **/
var parseBoolOperation = function(token) {
  if (token.value === ">") {
    return _createSuccess(_greater);
  }

  if (token.value === "<") {
    return _createSuccess(_less);
  }

  if (token.value === "=") {
    return _createSuccess(_equal);
  }

  if (token.value === "!=") {
    return _createSuccess(_notEqual);
  }

  if (token.value === ">=") {
    return _createSuccess(_greaterOrEqual);
  }

  if (token.value === "<=") {
    return _createSuccess(_lessOrEqual);
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
    operation = parseBoolOperation(currentToken);
    if (operation.error !== null) {
      return _createError(operation.error);
    }
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

/**
 * Parses the token stream for a body section and
 * returns a function which execute's the body's code.
 * Return:
 *   If error is present then body parsing failed,
 *   otherwise the function and updated stack are
 *   returned.
 *   { error : {}, result : fn, tokens : stack }
 **/
var parseBody = function(tokenStack) {
  var token        = tokenStack.peek(),
      resultTokens = tokenStack.shift(),
      expressions  = [],
      expressionParseResult, ret;

  if (token.value !== "stop") {
    return _createError({
      message : "'stop' token expected at: " + token,
      payload : token
    });
  }

  expressionParseResult = parseExpression(resultTokens);
  while (expressionParseResult.error === null) {
    resultTokens = expressionParseResult.tokens;
    expressions.unshift(expressionParseResult.result);

    expressionParseResult = parseExpression(resultTokens);
  }

  token = resultTokens.peek();
  if (token.value !== "start") {
    return _createError({
      message : "'start' token expected on line " + token.lineNum,
      payload : token
    });
  }

  ret = _createSuccess(function(sysvars) {
    expressions.forEach(function(expression) {
      expression(sysvars);
    });
  });
  ret.tokens = resultTokens;
  return ret;
};

/**
 * Parses the token stream as a cond block.
 * Returns:
 *   If an error is returned then parsing failed, otherwise
 *   returns a result object with a function which when
 *   executed returns a true or false indicating the cond
 *   block's output.
 **/
var parseCond = function(tokenStack) {
  var token        = tokenStack.peek(),
      resultTokens = tokenStack.shift(),
      expressions  = [],
      expressionParseResult, ret;

  if (token.value !== "start") {
    return _createError({
      message : "Expected 'start' token on line " + token.lineNum,
      payload : token
    });
  }

  expressionParseResult = parseExpression(resultTokens);
  while (expressionParseResult.error === null) {
    resultTokens = expressionParseResult.tokens;
    expressions.unshift(expressionParseResult.result);

    expressionParseResult = parseExpression(resultTokens);
  }

  token = resultTokens.peek();
  if (token.value !== "cond") {
    return _createError({
      message : "'cond' token expected on line " + token.lineNum,
      payload : token
    });
  }

  ret = _createSuccess(function(sysvars) {
    return expressions.reduce(function(total, expression) {
      return total && expression(sysvars);
    }, true);
  });
  ret.tokens = resultTokens.shift();
  return ret;
};

/**
 * Parses the token stack for the gene provided.
 * Return:
 *   If parsing failed then an object with an error
 *   is returned, otherwise result is a function
 *   which will execute the gene and tokens is the
 *   updated stack of tokens.
 *   { error : {} | null, result : fn, tokens : stack }
 **/
var parseGene = function(tokenStack) {
  var condResult, bodyResult,
      tokens, condCmd, bodyCmd, ret;

  bodyResult = parseBody(tokenStack);
  if (bodyResult.error !== null) {
    return _createError(bodyResult.error);
  }
  bodyCmd = bodyResult.result;
  tokens  = bodyResult.tokens;

  condResult = parseCond(tokens);
  if (condResult.error !== null) {
    return _createError(condResult.error);
  }
  condCmd = condResult.result;
  tokens  = condResult.tokens;

  ret = _createSuccess(function(sysvars) {
    if (condCmd(sysvars)) {
      bodyCmd(sysvars);
    }
  });
  ret.tokens = tokens;
  return ret;
};

/**
 * Parses the token stream for a set of genes and returns a function
 * which executes the genes.
 * Return:
 *   If parsing fails retuns an object with an error property,
 *   otherwise returns an object witha  result property equal
 *   to the execution function.
 **/
var parseDna = function(tokenStack) {
  var geneResult, tokens, genes = [];

  geneResult = parseGene(tokenStack);
  while (geneResult.error === null) {
    genes.unshift(geneResult.result);
    tokens = geneResult.tokens;

    geneResult = parseGene(tokens);
  }

  if (geneResult.error.payload.value === "") {
    return _createSuccess(function(sysvars) {
      genes.forEach(function(gene) {
        gene(sysvars);
      });
    });
  }

  return _createError(geneResult.error);
};

module.exports = {
  parseNumber        : parseNumber,
  parseOperation     : parseOperation,
  parseSysvar        : parseSysvar,
  parseSysvarAddr    : parseSysvarAddr,
  parseExpression    : parseExpression,
  parseBody          : parseBody,
  parseBoolOperation : parseBoolOperation,
  parseCond          : parseCond,
  parseGene          : parseGene,
  parseDna           : parseDna
};







