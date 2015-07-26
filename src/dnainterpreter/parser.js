var maxStackSize = 20;

/**
 * Pushes value into the stack, removing elements if the stack is too long.
 **/
var pushStack = function(stack, value) {
  stack.push(value);
  if (stack.length > maxStackSize) {
    stack.splice(0, 1);
  }
};

/**
 * Safely pops the last value from the stack, returns 0 if the stack is empty.
 **/
var popStack = function(stack) {
  var result = stack.pop();
  if (result === undefined) {
    return 0.0;
  }

  return result;
};

/**
 * Adds the top two values of the stack and pushes the result.
 **/
var add = function(stack) {
  var res = popStack(stack) + popStack(stack);
  pushStack(stack, res);
};

/**
 * Multiplies the top two values of the stack and pushes the result.
 **/
var mul = function(stack) {
  var res = popStack(stack) * popStack(stack);
  pushStack(stack, res);
};

/**
 * Divides the top two values of the stack where given the stack: [a, b]
 * the result is a / b.
 * Divide-by-zero results in a value of 0.0.
 * Result is pushed to the stack.
 **/
var div = function(stack) {
  var b = popStack(stack);
  var a = popStack(stack);

  if ( b === 0.0 ) {
    pushStack(stack, 0.0);
  }
  else {
    pushStack(stack, a / b);
  }
};

/**
 * Subtracts the top two values of the stack where given the stack: [a, b]
 * the result is a - b.
 * Result is pushed to stack.
 **/
var sub = function(stack) {
  var b = popStack(stack);
  var a = popStack(stack);

  pushStack(stack, a - b);
};


/**
 * PUBLIC API
 * All parser functions return either a function which accepts a stack (empty js array),
 * or undefined.
 **/

/**
 * Parses the given string for a literal.
 * If the literal is valid then returns a function which pushes the literal unto the stack.
 * Otherwise returns undefined.
 **/
var literal = function(code) {
  var result = parseFloat(code, 10);
  if (!isNaN(result)) {
    return function(stack) {
      pushStack(stack, result);
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


module.exports = {
  literal : literal,
  stackOp : stackOp
};
