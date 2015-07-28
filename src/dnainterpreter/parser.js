var sysvarNames = require('../constants/sysvarNames.js'),
    Immutable   = require('immutable');

/**
 * Pops the first two values from the top of the stack.
 * Returns the updated stack and the two values as an object.
 **/
var _popTopTwoValues = function(stack) {
  var a, b, aStack, bStack;
  b      = stack.peek();
  bStack = stack.shift();
  a      = bStack.peek();
  aStack = bStack.shift();

  return {
    a : a,
    b : b,
    stack : aStack
  };
};

/**
 * Pulls the first two values from the top of the stack and
 * passes them in order to the callback function.
 * Params:
 *   stack    -- Immutable.js Stack
 *   operator -- function(a, b) {}
 * Return:
 *   The stack with a and b popped and the operator's return value pushed.
 **/
var _valueStackBinaryOp = function(state, operator) {
  var res          = _popTopTwoValues(state.get("valueStack")),
      updatedStack = res.stack.unshift(operator(res.a || 0, res.b || 0));

  return state.set("valueStack", updatedStack);
};

/**
 * Adds the top values of the valueStack and pushes the result to the valueStack.
 * (a b add) === (a + b)
 * Returns:
 *   Updated state Map.
 **/
var _add = function(state) {
  return _valueStackBinaryOp(state, function(a, b) {
    return a + b;
  });
};

/**
 * Multiplies the top values of the valueStack and pushes the result to the valueStack.
 * Returns:
 *   Updated state Map.
 **/
var _mul = function(state) {
  return _valueStackBinaryOp(state, function(a, b) {
    return a * b;
  });
};

/**
 * Divides the top two values of the valueStack and pushes the result to the valueStack.
 * Divide-by-zero results in a value of 0.0.
 * (a b div) === a / b
 * Returns:
 *   Updated state Map.
 **/
var _div = function(state) {
  return _valueStackBinaryOp(state, function(a, b) {
    if (b === 0) {
      return 0;
    }

    return Math.round(a / b);
  });
};

/**
 * Subtracts the top two values of the valueStack and pushes the result to the valueStack.
 * (a b sub) === a - b
 * Returns:
 *   Updated state Map.
 **/
var _sub = function(state) {
  return _valueStackBinaryOp(state, function(a, b) {
    return a - b;
  });
};

/**
 * Stores a value in a sysvar. Top stack value is sysvar address, second stack value
 * is the value to store. Does nothing if sysvar address is out of the range [0-127].
 * (val addr store) === stores val in addr for sysvar
 * Returns:
 *   Updated state Map.
 **/
var _store = function(state) {
  var res          = _popTopTwoValues(state.get("valueStack")),
      updatedState = state.set("valueStack", res.stack),
      updatedSysvars;

  if (res.b >= 0 && res.b <= 127) {
    updatedSysvars = updatedState.get("sysvars").set(res.b, res.a);
    return updatedState.set("sysvars", updatedSysvars);
  }
  return updatedState;
};

/**
 * Pops top two values of the value stack, passes them to operation, and
 * pushes operation's result to the boolStack.
 * Returns:
 *   Updated state Map.
 **/
var _boolStackBinaryOp = function(state, operation) {
  var res              = _popTopTwoValues(state.get("valueStack")),
      updatedState     = state.set("valueStack", res.stack),
      updatedBoolStack = updatedState.get("boolStack").unshift(operation(res.a, res.b));

  return updatedState.set("boolStack", updatedBoolStack);
};

/**
 * Compares top two values of the valueStack [a, b] and pushes the result (a > b) to the
 * boolStack.
 * Returns:
 *   Updated state Map.
 **/
var _greaterThan = function(state) {
  return _boolStackBinaryOp(state, function(a, b) {
    return a > b;
  });
};

/**
 * Compares top two values of the value stack [a, b] and pushes the result (a < b) to the
 * boolStack.
 * Returns:
 *   Updated state Map.
 **/
var _lessThan = function(state) {
  return _boolStackBinaryOp(state, function(a, b) {
    return a < b;
  });
};

/**
 * Compares top two values of the value stack [a, b] and pushes the result (a === b) to the
 * boolStack.
 * Returns;
 *   Updated state Map.
 **/
var _equalTo = function(state) {
  return _boolStackBinaryOp(state, function(a, b) {
    return a === b;
  });
};

/**
 * Compares top two values of the value stack [a, b] and pushes the result (a !== b) to the
 * boolStack.
 * Returns:
 *   Updated state Map.
 **/
var _notEqualTo = function(state) {
  return _boolStackBinaryOp(state, function(a, b) {
    return a !== b;
  });
};

/**
 * Compares top two values of the value stack [a, b] and pushes the result (a >= b) to the
 * boolStack.
 * Returns:
 *   Updated state Map.
 **/
var _greaterOrEqual = function(state) {
  return _boolStackBinaryOp(state, function(a, b) {
    return a >= b;
  });
};

/**
 * Compares top two values of the value stack [a, b] and pushes the result (a <= b) to the
 * boolStack.
 * Returns:
 *   Updated state Map.
 **/
var _lessOrEqual = function(state) {
  return _boolStackBinaryOp(state, function(a, b) {
    return a <= b;
  });
};


/**
 * PUBLIC API
 * All parser functions return either a function which accepts a stack (empty js array),
 * or undefined.
 **/

/**
 * Adds a valueStack, a boolStack, and a sysvars map to the provided state Map.
 * Params:
 *   state -- Immutable map representing the bot's state. Creates a new map if
 *            none is provided.
 * Returns:
 *   Immutable Map representing the bot's state, with a valueStack, a boolStack, and
 *   a sysvars Map if none already existed.
 **/
var createState = function(state) {
  var updatedState = state || Immutable.Map(),
      defaultState = Immutable.Map({
        valueStack : Immutable.Stack(),
        boolStack  : Immutable.Stack(),
        sysvars    : Immutable.Map()
      });
  return updatedState.mergeDeep(defaultState);
};

/**
 * Pushes the given value onto the valueStack and returns the updated
 * state object.
 **/
var _pushValueStack = function(state, value) {
  var updatedStack = state.get("valueStack").unshift(value);

  return state.set("valueStack", updatedStack);
};

/**
 * Parses the given string for a literal.
 * If the literal is valid then returns a function which pushes the literal unto the stack.
 * Otherwise returns undefined.
 **/
var parseLiteral = function(code) {
  var result = parseInt(code, 10);
  if (!isNaN(result)) {
    return function(state) {
      return _pushValueStack(state, result);
    };
  }
  return undefined;
};

/**
 * Parses the given string as a sysvar.
 * If the string starts with *. then the _value_ of the sysvar is pushed
 * onto the stack, otherwise the _address_ of the sysvar is pushed
 * onto the stack.
 **/
var parseSysvar = function(code) {
  var addr = 0,
      getSysvarAddr = function(addrStr) {
        var parsedAddr = sysvarNames.get(addrStr);
        if (parsedAddr === undefined) {
          return parseInt(addrStr, 10);
        }

        return parsedAddr;
      };

  if (code[0] === ".") {
    // this may not parse as an int, check for sysvars
    addr = getSysvarAddr(code.slice(1));
    if (!isNaN(addr)) {
      return function(state) {
        return _pushValueStack(state, addr);
      };
    }
    return undefined;
  }

  if (code[0] === "*" && code[1] === ".") {
    addr = getSysvarAddr(code.slice(2));
    if (!isNaN(addr)) {
      return function(state) {
        return _pushValueStack(state,
          state.get("sysvars").get(addr) || 0);
      };
    }
  }

  return undefined;
};

/**
 * Parses the given string as a StackOp and returns a function which
 * executes the operation.
 **/
var parseStackOp = function(code) {
  var lit, sysVar;

  lit = parseLiteral(code);
  if (lit !== undefined) {
    return lit;
  }

  sysVar = parseSysvar(code);
  if (sysVar !== undefined) {
    return sysVar;
  }

  if (code === "add") {
    return _add;
  }

  if (code === "sub") {
    return _sub;
  }

  if (code === "mul") {
    return _mul;
  }

  if (code === "div") {
    return _div;
  }

  if (code === "store") {
    return _store;
  }

  return undefined;
};

/**
 * Parses the given stream of whitespace-stripped tokens and returns a function
 * which, when given a stack, executes the provided code.
 * Returns undefined if this is a invalid body segment (e.g. does not start with
 * the "start" string).
 **/
var parseBodyBlock = function(tokenList) {
  var ops   = [],
      op    = {},
      opStr = "";

  opStr = tokenList.shift();
  op    = parseStackOp(opStr);
  while(op !== undefined && tokenList.length > 0) {
    ops.push(op);

    opStr = tokenList.shift();
    op    = parseStackOp(opStr);
  }

  // If we hit a premature "cond" or "start" then push the token back into the stream
  // for consumption later.
  if (opStr === "cond" || opStr === "start") {
    tokenList.unshift(opStr);
  }


  return function(state) {
    return ops.reduce(function(prevState, op) {
      return op(prevState);
    }, state);
  };
};

/**
 * Parses the code-point as a BoolOp. If parsing is successful then
 * returns a function which computes the bool op, else returns undefined.
 **/
var parseBoolOp = function(code) {
  if (code.length > 2) { return undefined; } // quick check

  if (code === ">") {
    return _greaterThan;
  }

  if (code === "<") {
    return _lessThan;
  }

  if (code === "=") {
    return _equalTo;
  }

  if (code === "!=") {
    return _notEqualTo;
  }

  if (code === ">=") {
    return _greaterOrEqual;
  }

  if (code === "<=") {
    return _lessOrEqual;
  }

  return undefined;
};

var parseCondExpr = function(code) {
  var op = parseBoolOp(code);
  if (op === undefined) {
    return parseStackOp(code);
  }

  return op;
};

var parseCondBlock = function(tokenList) {
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
  expr    = parseCondExpr(exprStr);
  while(expr !== undefined && tokenList.length > 0) {
    condExprs.push(expr);

    exprStr = tokenList.shift();
    expr    = parseCondExpr(exprStr);
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
    return condExprs.reduce(function(prevState, expr) {
      return expr(prevState);
    }, state);
  };
};

var parseGene = function(tokenList) {
  var cond = parseCondBlock(tokenList);

  while(cond === undefined && tokenList.length > 0 && tokenList[0] !== "end") {
    cond = parseCondBlock(tokenList);
  }

  if (cond === undefined) {
    return undefined;
  }

  var body = parseBodyBlock(tokenList);
  if (body === undefined) {
    return undefined;
  }

  return function(state) {
    var execute = false,
        postCondState;

    postCondState = cond(state);

    execute = postCondState.get("boolStack").reduce(function(total, val) {
      return total & val;
    }, true);

    if (execute) {
      return body(postCondState);
    }

    return postCondState;
  };
};

/**
 * Clears the value and bool stacks. Returns the updated state.
 **/
var _clearStacks = function(state) {
  var clearedValueStack = state.get("valueStack").clear(),
      clearedBoolStack  = state.get("boolStack").clear(),
      updatedState      = state.set("valueStack", clearedValueStack);

  return updatedState.set("boolStack", clearedBoolStack);
};

var parseDna = function(tokenList) {
  var geneBlock  = parseGene(tokenList),
      genes = [];

  while(geneBlock !== undefined) {
    genes.push(geneBlock);

    geneBlock = parseGene(tokenList);
  }

  return function(state) {
    return genes.reduce(function(prevState, geneBlock) {
      return geneBlock(_clearStacks(prevState));
    }, state);
  };
};

module.exports = {
  parseLiteral   : parseLiteral,
  parseStackOp   : parseStackOp,
  parseBody      : parseBodyBlock,
  createState    : createState,
  parseBoolOp    : parseBoolOp,
  parseCondExpr  : parseCondExpr,
  parseCondBlock : parseCondBlock,
  parseGene      : parseGene,
  parseDna       : parseDna,
  parseSysvar    : parseSysvar
};













