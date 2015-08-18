/**
 * This module contains all of the functions required to compile tokenized
 * DarwinBots dna into a usable javascript function.
 * @module dnaInterpreter
 **/

/**
 * DnaFunction is what all of the parse* funtions return in their Ok value
 * when they execute successfully.
 * @typedef DnaFunction
 * @type {Function}
 * @param {Object} sysvars - Sysvars will be updated by the DnaFunction.
 **/

var Result = require('object-result'),
    Ok     = Result.Ok,
    Err    = Result.Err;

var _validateNumber = function(val) {
  return typeof val === "number" && isFinite(val) ? val : 0;
};

var _add = function(a, b) {
  return _validateNumber(a) + _validateNumber(b);
};

var _sub = function(a, b) {
  return _validateNumber(a) - _validateNumber(b);
};

var _mult = function(a, b) {
  return _validateNumber(a) * _validateNumber(b);
};

var _div = function(a, b) {
  return Math.round(_validateNumber(
    _validateNumber(a) / _validateNumber(b)
  ));
};

var _store = function(a, b, sysvars) {
  sysvars[b] = _validateNumber(a);
  return sysvars[b];
};

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

var parseNumber =
/**
 * Parses the token's value for the integer it represents.
 * @param {module:tokenizer~Token} token - Token to parse
 * @return {module:object-result~Result}
 **/
module.exports._private.parseNumber = function(token) {
  var number = parseInt(token.value, 10);
  if (isNaN(number)) {
    return Err(token);
  }

  return Ok(function() {
    return number;
  });
};

var parseSysvar =
/**
 * Parses a token as a sysvar returning a function which
 * will return the sysvar's value when called.
 * @param {module:tokenizer~Token}
 * @return {module:object-result~Result}
 **/
module.exports._private.parseSysvar = function(token) {
  var addr = 0;

  if (token.value[0] !== "*" || token.value[1] !== ".") {
    return Err(token);
  }

  addr = token.value.slice(2);

  return Ok(function(sysvars) {
    return sysvars[addr] || 0;
  });
};

var parseSysvarAddr =
/**
 * Parses the token as a sysvar address command.
 * @param {module:tokenizer~Token} token - The token to parse.
 * @return {module:object-result~Result}
 **/
module.exports._private.parseSysvarAddr = function(token) {
  var addr;

  if (token.value[0] !== ".") {
    return Err(token);
  }

  addr = token.value.slice(1);

  return Ok(function() {
    return addr;
  });
};

var parseValue =
/**
 * Parses the token as a sysvar, a sysvar address, or a numeric
 * literal.
 * @param {module:tokenizer~Token} token - The token to parse.
 * @return {module:object-result~Result}
 **/
module.exports._private.parseValue = function(token) {
  return parseSysvarAddr(token)
    .or_else(parseSysvar(token))
    .or_else(parseNumber(token));
};

var parseOperation =
/**
 * Parses the token's value for an operator.
 * @param {module:tokenizer~Token} token - The token to parse as an operator.
 * @return {module:object-result~Result}
 **/
module.exports._private.parseOperation = function(token) {
  if (token.value === "add") {
    return Ok(_add);
  }

  if (token.value === "sub") {
    return Ok(_sub);
  }

  if (token.value === "mult") {
    return Ok(_mult);
  }

  if (token.value === "div") {
    return Ok(_div);
  }

  if (token.value === "store") {
    return Ok(_store);
  }

  return Err(token);
};

var parseBoolOperation =
/**
 * Parses the token's value as a boolean operation.
 * @param {module:tokenizer~Token} token - The token to parse as a bool op.
 * @return {module:object-result~Result}
 **/
module.exports._private.parseBoolOperation = function(token) {
  if (token.value === ">") {
    return Ok(_greater);
  }

  if (token.value === "<") {
    return Ok(_less);
  }

  if (token.value === "=") {
    return Ok(_equal);
  }

  if (token.value === "!=") {
    return Ok(_notEqual);
  }

  if (token.value === ">=") {
    return Ok(_greaterOrEqual);
  }

  if (token.value === "<=") {
    return Ok(_lessOrEqual);
  }

  return Err(token);
};

/* forward declaration */
var parseExpression = function() { return; };

var parseStatement =
/**
 * Parses the token stack assuming the next token is a value.
 * If the assumption is false then the token will be parsed
 * as an expression.
 * @param {module:tokenizer~Token[]} tokenStack - Immutable.js stack of tokens to parse.
 * @return {module:object-result~Result} - Ok value is an object with two properties,
 *                                         a dnaFunction and tokens.
 *                                         Representing the DnaFunction for the statement
 *                                         and the resulting tokenStack.
 **/
module.exports._private.parseStatement = function(tokenStack) {
  var token = tokenStack.peek();

  return parseValue(token)
    .and_then(function(dnaFunction) {
      return Ok({ dnaFunction : dnaFunction, tokens : tokenStack.shift() });
    })
    .or_else(parseExpression(tokenStack));
};

parseExpression =
/**
 * Parses a stack of tokens, consuming each one in turn,
 * until a complete statement is built or an error
 * occurs.
 * @param {module:tokenizer~Token[]} tokenStack - Immutable.js stack of token objects.
 * @return {module:object-result~Result} - Ok value is an object with two properties,
 *                                         dnaFunction and tokens.
 **/
module.exports._private.parseExpression = function(tokenStack) {
  var currentToken = tokenStack.peek(),
      operation, resultA, resultB,
      opDnaFunc, dnaFuncA, dnaFuncB;

  operation = parseOperation(currentToken)
    .or_else(parseBoolOperation(currentToken));
  if (operation.is_err()) {
    return operation;
  }

  tokenStack = tokenStack.shift();
  resultA    = parseStatement(tokenStack);
  if (resultA.is_err()) {
    return resultA;
  }

  tokenStack = resultA.get_ok().tokens;
  resultB    = parseStatement(tokenStack);
  if (resultB.is_err()) {
    return resultB;
  }

  tokenStack = resultB.get_ok().tokens;
  opDnaFunc  = operation.get_ok().dnaFunction;
  dnaFuncA   = resultA.get_ok().dnaFunction;
  dnaFuncB   = resultB.get_ok().dnaFunction;
  return Ok({
    dnaFunction : function(sysvars) {
      var b = dnaFuncB(sysvars);
      var a = dnaFuncA(sysvars);
      return opDnaFunc(b, a, sysvars);
    },
    tokens : tokenStack
  });
};

var parseBody =
/**
 * Parses the token stream for a body section and
 * returns a function which execute's the body's code.
 * @param {module:tokenizer~Token[]} tokenStack - Immutable.js stack of tokens.
 * @return {module:object-result~Result} - Ok value is an object with
 *                                         properties dnaFunction and tokens.
 **/
module.exports._private.parseBody = function(tokenStack) {
  var token        = tokenStack.peek(),
      expressions  = [],
      expressionParseResult, ret;

  if (token.value !== "stop") {
    return Err("'stop' expected on line " + token.lineNum +
               " before " + token.value);
  }
  tokenStack = tokenStack.shift();

  expression = parseExpression(tokenStack);
  while (!expression.is_err()) {
    expressions.unshift(expression.get_ok().dnaFunction);

    tokenStack = expression.get_ok().tokens;
    expression = parseExpression(tokenStack);
  }

  token = resultTokens.peek();
  if (token.value !== "start") {
    return Err("'start' token expected on line " + token.lineNum +
               " before " + token.value);
  }

  return Ok({
    dnaFunction : function(sysvars) {
      expressions.forEach(function(expression) {
        expression(sysvars);
      });
    },
    tokens : tokenStack
  });
};

var parseCond =
/**
 * Parses the token stream as a cond block.
 * @param {module:tokenizer~Token[]} tokenStack - Immutable.js stack of tokens.
 * @return {module:object-result} - Ok value is an object with two properties,
 *                                  dnaFunction and tokens.
 **/
module.exports._private.parseCond = function(tokenStack) {
  var expressions  = [],
      expression;

  if (tokenStack.peek().value !== "start") {
    return Err("Expected 'start' token on line " + token.lineNum +
               " before " + token.value);
  }
  tokenStack = tokenStack.shift();

  expression = parseExpression(tokenStack);
  while (!expression.is_err()) {
    expressions.unshift(expression.get_ok().dnaFunction);
    tokenStack = expression.get_ok().tokens;

    expression = parseExpression(tokenStack);
  }

  if (tokenStack.peek().value !== "cond") {
    return Err("'cond' token expected on line " + token.lineNum +
               " before " + token.value);
  }

  return Ok({
    dnaFunction : function(sysvars) {
      return expressions.reduce(function(total, expression) {
        return total && expression(sysvars);
      }, true);
    },
    tokens : tokenStack.shift()
  });
};

var parseGene =
/**
 * Parses the token stack for the gene provided.
 * @param {module:tokenizer~Token[]} tokenStack - Immutable.js stack of tokens.
 * @return {module:object-result~Result} - Ok value is an object with
 *                                         properties dnaFunction and tokens.
 **/
module.exports._private.parseGene = function(tokenStack) {
  var body, cond, bodyCmd, condCmd;

  body = parseBody(tokenStack);
  if (body.is_err()) {
    return body;
  }
  tokenStack = body.get_ok().tokens;

  cond = parseCond(tokenStack);
  if (cond.is_err()) {
    return cond;
  }

  bodyCmd = body.get_ok().dnaFunction;
  condCmd = cond.get_ok().dnaFunction;
  return Ok({
    dnaFunction : function(sysvars) {
      if (condCmd(sysvars)) {
        bodyCmd(sysvars);
      }
    },
    tokens : cond.get_ok().tokens
  });
};

/**
 * Parses the token stream for a set of genes and returns a function
 * which executes the genes.
 * @param {module:tokenizer~Token[]} tokenStack - Immutable.js stack of tokens.
 * @return {module:dnaInterpreter~DnaFunction}
 **/
module.exports.parseDna = function(tokenStack) {
  var gene, genes;

  gene = parseGene(tokenStack);
  while (!gene.is_err()) {
    genes.unshift(gene.get_ok().dnaFunction);
    tokenStack = gene.get_ok().tokens;

    gene = parseGene(tokenStack);
  }

  return function(sysvars) {
    genes.forEach(function(gene) {
      gene(sysvars);
    });
  };
};

