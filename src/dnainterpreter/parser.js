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
 * PUBLIC API
 * All parser functions return either a function which accepts a stack (empty js array),
 * or undefined.
 **/

/**
 * Creates an instance of the bot state used by the parser.
 * Bot state is just an object of the form:
 * {
 *   valStack : createStack(0, 20)
 * }
 **/
var createState = function() {
  return {
    valStack : createStack(0, 20)
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
var body = function(tokenList) {
  var getNextToken = (function() {
    var index = 0;
    return function() {
      if (index >= tokenList.length) {
        return "";
      }
      var curIdx = index;
      index += 1;
      return tokenList[curIdx];
    };
  }());
  var ops = [];

  var op = stackOp(getNextToken());
  while(op !== undefined) {
    ops.push(op);
    op = stackOp(getNextToken());
  }

  return function(state) {
    ops.forEach(function(op) {
      op(state);
    });
  };
};


module.exports = {
  literal     : literal,
  stackOp     : stackOp,
  body        : body,
  createState : createState
};
