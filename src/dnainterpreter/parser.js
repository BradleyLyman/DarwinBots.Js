var createStack = require('../util/stack.js');

/**
 * Adds the top two values of the stack and pushes the result.
 **/
var add = function(state) {
  var res = state.valStack.pop() + state.valStack.pop();
  state.valStack.push(res);
};

/**
 * Multiplies the top two values of the stack and pushes the result.
 **/
var mul = function(state) {
  var res = state.valStack.pop() * state.valStack.pop();
  state.valStack.push(res);
};

/**
 * Divides the top two values of the stack where given the stack: [a, b]
 * the result is a / b.
 * Divide-by-zero results in a value of 0.0.
 * Result is pushed to the stack.
 **/
var div = function(state) {
  var b = state.valStack.pop();
  var a = state.valStack.pop();

  if ( b === 0 ) {
    state.valStack.push(0);
  }
  else {
    state.valStack.push(Math.round(a / b));
  }
};

/**
 * Subtracts the top two values of the stack where given the stack: [a, b]
 * the result is a - b.
 * Result is pushed to stack.
 **/
var sub = function(state) {
  var b = state.valStack.pop();
  var a = state.valStack.pop();

  state.valStack.push(a - b);
};

/**
 * Compares top two values of the value stack [a, b] and pushes the result (a > b) to the
 * boolStack.
 **/
var greaterThan = function(state) {
  var b = state.valStack.pop();
  var a = state.valStack.pop();

  state.boolStack.push(a > b);
};

/**
 * Compares top two values of the value stack [a, b] and pushes the result (a < b) to the
 * boolStack.
 **/
var lessThan = function(state) {
  var b = state.valStack.pop();
  var a = state.valStack.pop();

  state.boolStack.push(a < b);
};

/**
 * Compares top two values of the value stack [a, b] and pushes the result (a === b) to the
 * boolStack.
 **/
var equalTo = function(state) {
  var b = state.valStack.pop();
  var a = state.valStack.pop();

  state.boolStack.push(a === b);
};

/**
 * Compares top two values of the value stack [a, b] and pushes the result (a !== b) to the
 * boolStack.
 **/
var notEqualTo = function(state) {
  var b = state.valStack.pop();
  var a = state.valStack.pop();

  state.boolStack.push(a !== b);
};

/**
 * Compares top two values of the value stack [a, b] and pushes the result (a >= b) to the
 * boolStack.
 **/
var greaterOrEqual = function(state) {
  var b = state.valStack.pop();
  var a = state.valStack.pop();

  state.boolStack.push(a >= b);
};

/**
 * Compares top two values of the value stack [a, b] and pushes the result (a <= b) to the
 * boolStack.
 **/
var lessOrEqual = function(state) {
  var b = state.valStack.pop();
  var a = state.valStack.pop();

  state.boolStack.push(a <= b);
};


/**
 * PUBLIC API
 * All parser functions return either a function which accepts a stack (empty js array),
 * or undefined.
 **/

/**
 * Creates an instance of the bot state used by parser's output.
 **/
var createState = function() {
  return {
    valStack  : createStack(0, 20),
    boolStack : createStack(true, 20)
  };
};

/**
 * Parses the given string for a literal.
 * If the literal is valid then returns a function which pushes the literal unto the stack.
 * Otherwise returns undefined.
 **/
var literal = function(code) {
  var result = parseInt(code, 10);
  if (!isNaN(result)) {
    return function(state) {
      state.valStack.push(result);
    };
  }
  return undefined;
};

/**
 * Parses the given string as a StackOp and returns a function which
 * executes the operation.
 **/
var stackOp = function(code) {
  var lit = literal(code);
  if (lit !== undefined) {
    return lit;
  }

  if (code.match(/add/)) {
    return add;
  }

  if (code.match(/sub/)) {
    return sub;
  }

  if (code.match(/mul/)) {
    return mul;
  }

  if (code.match(/div/)) {
    return div;
  }

  return undefined;
};

/**
 * Parses the given stream of whitespace-stripped tokens and returns a function
 * which, when given a stack, executes the provided code.
 * Returns undefined if this is a invalid body segment (e.g. does not start with
 * the "start" string).
 **/
var bodyBlock = function(tokenList) {
  var ops   = [],
      op    = {},
      opStr = "";

  opStr = tokenList.shift();
  op    = stackOp(opStr);
  while(op !== undefined && tokenList.length > 0) {
    ops.push(op);

    opStr = tokenList.shift();
    op    = stackOp(opStr);
  }

  // If we hit a premature "cond" or "start" then push the token back into the stream
  // for consumption later.
  if (opStr === "cond" || opStr === "start") {
    tokenList.unshift(opStr);
  }


  return function(state) {
    ops.forEach(function(op) {
      op(state);
    });
  };
};

/**
 * Parses the code-point as a BoolOp. If parsing is successful then
 * returns a function which computes the bool op, else returns undefined.
 **/
var boolOp = function(code) {
  if (code.length > 2) { return undefined; } // quick check

  if (code === ">") {
    return greaterThan;
  }

  if (code === "<") {
    return lessThan;
  }

  if (code === "=") {
    return equalTo;
  }

  if (code === "!=") {
    return notEqualTo;
  }

  if (code === ">=") {
    return greaterOrEqual;
  }

  if (code === "<=") {
    return lessOrEqual;
  }

  return undefined;
};

var condExpr = function(code) {
  var op = boolOp(code);
  if (op === undefined) {
    return stackOp(code);
  }

  return op;
};

var condBlock = function(tokenList) {
  var exprStr   = "",
      expr      = {},
      condExprs = [];

  exprStr = tokenList.shift();

  if (exprStr !== "cond") {
    if (exprStr === "start") {
      return function() {
        /* do nothing, there are no conditions */
        return;
      };
    }
    return undefined;
  }

  exprStr = tokenList.shift();
  expr    = condExpr(exprStr);
  while(expr !== undefined && tokenList.length > 0) {
    condExprs.push(expr);

    exprStr = tokenList.shift();
    expr    = condExpr(exprStr);
  }

  // if code is malformed so that this cond runs into another,
  // then this cond is a no-op and the next cond token should
  // be returned to the stream.
  if (exprStr === "cond") {
    tokenList.unshift(exprStr);
    return undefined;
  }

  // This token stream runs into a stop command without a body
  // so no point in evaluating the cond block.
  if (exprStr === "stop") {
    return undefined;
  }

  // This token stream hits a premature end. Push the end token
  // in case someone is interested in it then return a no-op.
  if (exprStr === "end") {
    tokenList.unshift(exprStr);
    return undefined;
  }

  // Ran out of tokens before we hit a terminating condition
  // so return undefined.
  if (exprStr !== "start" && tokenList.length === 0) {
    return undefined;
  }

  return function(state) {
    condExprs.forEach(function(expr) {
      expr(state);
    });
  };
};

var gene = function(tokenList) {
  var cond = condBlock(tokenList);

  while(cond === undefined && tokenList.length > 0 && tokenList[0] !== "end") {
    cond = condBlock(tokenList);
  }

  if (cond === undefined) {
    return undefined;
  }

  var body = bodyBlock(tokenList);
  if (body === undefined) {
    return undefined;
  }

  return function(state) {
    var execute = false;

    cond(state);

    execute = state.boolStack.stack.reduce(function(prev, cur) {
      return prev && cur;
    }, true);

    if (execute) {
      body(state);
    }
  };
};

module.exports = {
  literal     : literal,
  stackOp     : stackOp,
  body        : bodyBlock,
  createState : createState,
  boolOp      : boolOp,
  condExpr    : condExpr,
  condBlock   : condBlock,
  gene        : gene
};













