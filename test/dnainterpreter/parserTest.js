var parser      = require('../../src/dnainterpreter/parser.js'),
    sysvarNames = require('../../src/constants/sysvarNames.js');

/**
 * Pushes the given value onto the valueStack and returns the updated
 * state object.
 **/
var _pushValueStack = function(state, value) {
  var updatedStack = state.get("valueStack").unshift(value);

  return state.set("valueStack", updatedStack);
};

/**
 * Sets the sysvar to the value specified.
 **/
var _setSysvar = function(state, addr, value) {
  var updatedVars = state.get("sysvars").set(addr, value);

  return state.set("sysvars", updatedVars);
};

var geneBlocks = {
  condTrue     : ["cond", "1", "2", "<", "start", "4", "stop"],
  condFalse    : ["cond", "1", "2", ">", "start", "4", "stop"],
  lateCond     : ["1", "cond", "1", "2", "<", "start", "4", "stop"],
  end          : ["5", "100", "add", "end"],
  prematureEof : ["1", "add", "stop", "mul"]
};

module.exports.testGene = {
  prematureEof : function(test) {
    var gene = parser.parseGene(geneBlocks.prematureEof);

    test.equals(geneBlocks.prematureEof.length, 0, "should consume entire token stream");
    test.equals(gene, undefined, "premature eof should stop gene search");
    test.done();
  },

  testEndFound : function(test) {
    var gene = parser.parseGene(geneBlocks.end);

    test.equals(gene, undefined, "reaching end of file should stop gene search");
    test.done();
  },

  testLateCond : function(test) {
    var gene = parser.parseGene(geneBlocks.lateCond);
    test.ok(gene);
    test.done();
  },

  testCondTrue : function(test) {
    var gene  = parser.parseGene(geneBlocks.condTrue),
        state = gene(parser.createState());

    test.equals(state.get("valueStack").peek(), 4, "body should have executed");
    test.done();
  },

  testCondFalse : function(test) {
    var gene  = parser.parseGene(geneBlocks.condFalse),
        state = gene(parser.createState());

    test.equals(state.get("valueStack").size, 0, "body should not have executed");
    test.done();
  }
};

var condBlocks = {
  validBlock          : ["cond", "1", "2", ">", "3", "2", "1", "add", "=", "start"],
  invalidStart        : ["1", "2", ">", "start"],
  unexpectedEof       : ["cond", "1", "2", ">"],
  invalidContinuation : ["cond", "1", "2", ">", "cond"],
  validEndBlock       : ["cond", "1", "2", "end"],
  validNoOpBlock      : ["cond", "1", "2", ">", "stop"],
  validEmptyBlock     : ["start", "1", "2", "add"]
};

module.exports.testCondBlock = {
  testValidEmptyBlock : function(test) {
    var block = parser.parseCondBlock(condBlocks.validEmptyBlock);

    test.ok(block, "block should be a function");
    test.equals(condBlocks.validEmptyBlock[0], "1", "start should be stripped from token stream");
    test.done();
  },

  testValidEndBlock : function(test) {
    var block = parser.parseCondBlock(condBlocks.validEndBlock);

    test.equals(block, undefined, "premature end should result in a no-op");
    test.equals(condBlocks.validEndBlock[0], "end", "End token should be all that remains in token stream");
    test.done();
  },

  testValidNoOpBlock : function(test) {
    var block = parser.parseCondBlock(condBlocks.validNoOpBlock);

    test.equals(block, undefined, "stop token should result in a no-op");
    test.equals(condBlocks.validNoOpBlock.length, 0, "all tokens should be consumed");
    test.done();
  },

  testValidBlock : function(test) {
    var block      = parser.parseCondBlock(condBlocks.validBlock),
        state      = block(parser.createState()),
        boolStack  = state.get("boolStack"),
        valueStack = state.get("valueStack");

    test.equals(condBlocks.validBlock.length, 0, "condBlock did not consume all tokens when parsing");

    test.equals(boolStack.size,  2, "both conditional statements should leave values on the stack");
    test.equals(valueStack.size, 0, "all values should have been used");
    test.ok(boolStack.peek(),          "second conditional should be true");
    test.ok(!boolStack.shift().peek(), "first conditional should be false");
    test.done();
  },

  testInvalidStart : function(test) {
    var block = parser.parseCondBlock(condBlocks.invalidStart);

    test.equals(block, undefined, "Block should be undefined");
    test.done();
  },

  testUnexpectedEof : function(test) {
    var block = parser.parseCondBlock(condBlocks.unexpectedEof);

    test.equals(block, undefined, "UnexpectedEof should result in a no-op");
    test.done();
  },

  testInvalidContinuation : function(test) {
    var block = parser.parseCondBlock(condBlocks.invalidContinuation);

    test.equals(block, undefined, "InvalidContinuation should be undefined");
    test.equals(condBlocks.invalidContinuation.length, 1, "second cond token should remain in stream");
    test.equals(condBlocks.invalidContinuation[0], "cond", "second cond token should remain in stream");
    test.done();
  },
};


module.exports.testCondExpr = function(test) {
  var stackOp = parser.parseCondExpr("5"),
      boolOp  = parser.parseCondExpr(">"),
      noOp    = parser.parseCondExpr("start"),
      state   = boolOp(stackOp(parser.createState()));

  test.ok(stackOp, "StackOp expected to return a function");
  test.ok(boolOp, "BoolOp expected to return a function");
  test.equals(noOp, undefined, "noOp expected to be undefined");

  test.equals(state.get("boolStack").peek(), false, "Expected value to be false");

  test.done();
};

var boolTest = function(test, op, paramArray) {
  var boolOp = parser.parseBoolOp(op);

  test.ok(boolOp, "Expected boolOp, " + op + ", to be a function");

  paramArray.forEach(function(testObj) {
    var firstState = _pushValueStack(parser.createState(), testObj.vals[0]),
        state      = boolOp(_pushValueStack(firstState, testObj.vals[1]));

    test.equals(state.get("boolStack").peek(), testObj.expected,
      "Incorrect result when processing " + op + " with vals: " + testObj.vals);
  });
  test.done();
};

module.exports.testBoolOp = {
  testGreaterThan : function(test) {
    boolTest(test, ">", [
      {
        vals : [2, 10],
        expected : false
      },
      {
        vals : [10, -5],
        expected : true
      }
    ]);
  },

  testLessThan : function(test) {
    boolTest(test, "<", [
      {
        vals : [2, 10],
        expected : true
      },
      {
        vals : [10, -5],
        expected : false
      }
    ]);
  },

  testEqual : function(test) {
    boolTest(test, "=", [
      {
        vals : [0, 34],
        expected : false
      },
      {
        vals : [10, 10],
        expected : true
      }
    ]);
  },

  testNotEqual : function(test) {
    boolTest(test, "!=", [
      {
        vals : [0, 34],
        expected : true
      },
      {
        vals : [10, 10],
        expected : false
      }
    ]);
  },

  testGreaterOrEqual : function(test) {
    boolTest(test, ">=", [
      {
        vals : [0, 3],
        expected : false
      },
      {
        vals : [3, 2],
        expected : true
      },
      {
        vals : [-34, -34],
        expected : true
      }
    ]);
  },

  testLessOrEqual : function(test) {
    boolTest(test, "<=", [
      {
        vals : [0, 3],
        expected : true
      },
      {
        vals : [3, 2],
        expected : false
      },
      {
        vals : [20, 20],
        expected : true
      }
    ]);
  }
};

var literalStrings = {
  valid   : "  99 ",
  invalid : "ab3a"
};

module.exports.testLiteral = {
  valid : function(test) {
    var literal = parser.parseLiteral(literalStrings.valid),
        state   = literal(parser.createState());

    test.equals(state.get("valueStack").peek(), 99, "literal value should be pushed to stack");
    test.done();
  },

  invalid : function(test) {
    var literal = parser.parseLiteral(literalStrings.invalid);

    test.equals(literal, undefined, "invalid literal should be undefined");
    test.done();
  }
};


var binOpTest = function(test, stackVals, op, value) {
  var state        = parser.createState(),
      updatedState = state.set("valueStack",
        state.get("valueStack").unshiftAll(stackVals.reverse())
      ),

      operation  = parser.parseStackOp(op),

      finalState = operation(updatedState);

  test.equals(finalState.get("valueStack").size, 1);
  test.equals(finalState.get("valueStack").peek(), value);
};

module.exports.testStackOp = {
  testSysvar : function(test) {
    binOpTest(test, [], ".10", 10);
    binOpTest(test, [], "*.10", 0);
    test.done();
  },

  testAdd : function(test) {
    binOpTest(test, [2, 10], "add", 12);
    binOpTest(test, [], "add", 0);
    test.done();
  },

  testSub : function(test) {
    binOpTest(test, [2, 10], "sub", -8);
    binOpTest(test, [], "sub", 0);
    test.done();
  },

  testMul : function(test) {
    binOpTest(test, [2, 10], "mul", 20);
    binOpTest(test, [], "mul", 0);
    test.done();
  },

  testDiv : function(test) {
    binOpTest(test, [2, 10], "div", 0);
    binOpTest(test, [10, 2], "div", 5);
    binOpTest(test, [], "div", 0);
    test.done();
  },

  testUnknown : function(test) {
    test.equals(parser.parseStackOp("aoeu"), undefined, "Unknown stack-ops should be unknown");
    test.done();
  },

  testStore : function(test) {
    var storeCmd   = parser.parseStackOp("store"),
        firstState = _pushValueStack(parser.createState(), 1000),
        state      = storeCmd(_pushValueStack(firstState, 10));

    test.equals(state.get("sysvars").get(10), 1000, "1000 should be stored in sysvar .10");
    test.done();
  }
};

var bodyBlocks = {
  validBlock    : ["1", "2", "add", "5", "3", "mul", "sub", "stop"],
  prematureEnd  : ["1", "end"],
  prematureCond : ["1", "2", "mul", "cond", "<"],
  prematureBody : ["1", "2", "start"],
  prematureEof  : ["1", "2", "add"]
};

module.exports.testBody = {
  testPrematureEof : function(test) {
    var block = parser.parseBody(bodyBlocks.prematureEof);

    test.ok(block, "block should be a valid function");
    test.done();
  },

  testPrematureBody : function(test) {
    var block = parser.parseBody(bodyBlocks.prematureBody);

    test.ok(block, "block should be a valid function");
    test.equals(bodyBlocks.prematureBody[0], "start");
    test.done();
  },

  testPrematureCond : function(test) {
    var block = parser.parseBody(bodyBlocks.prematureCond);

    test.ok(block, "block should be a valid function");
    test.equals(bodyBlocks.prematureCond[0], "cond");
    test.done();
  },

  testValidBlock : function(test) {
    var state = parser.parseBody(bodyBlocks.validBlock)(parser.createState());

    test.equals(state.get("valueStack").size, 1,
      "Stack should only have a length of 1 after this body executes");
    test.equals(state.get("valueStack").peek(), -12, "First stack value should be -12");
    test.done();
  },

  testPrematureEnd : function(test) {
    var body = parser.parseBody(bodyBlocks.prematureEnd),
        state = body(parser.createState());

    test.equals(state.get("valueStack").peek(), 1,
      "value stack should hold last op's value: 1 expceted but " +
      state.get("valueStack").peek() + " found");
    test.done();
  }
};

var sysvarStrings = {
  addr           : ".10",
  val            : "*.10",
  malformed      : "10",
  sysvarNameAddr : ".up",
  sysvarNameVal  : "*.up"
};

module.exports.testSysvars = {
  readNamedSysvarAddr : function(test) {
    var varcmd = parser.parseSysvar(sysvarStrings.sysvarNameAddr),
        state  = varcmd(parser.createState());

    test.equals(state.get("valueStack").peek(), sysvarNames.get("up"),
      "Address of sysvar should be pushed");
    test.done();
  },

  readNamedSysvarValue : function(test) {
    var varcmd             = parser.parseSysvar(sysvarStrings.sysvarNameVal),
        updatedSysvarState = _setSysvar(parser.createState(), sysvarNames.get("up"), 100),
        state              = varcmd(updatedSysvarState);

    test.equals(state.get("valueStack").peek(), 100, "sysvar value should be pushed onto stack");
    test.done();
  },

  pushSysvarAddr : function(test) {
    var varcmd = parser.parseSysvar(sysvarStrings.addr),
        state  = varcmd(parser.createState());

    test.equals(state.get("valueStack").peek(), 10, "Addr command should push sysvar address to stack");
    test.done();
  },

  pushSysvarVal : function(test) {
    var varcmd       = parser.parseSysvar(sysvarStrings.val),
        state        = varcmd(parser.createState()),
        updatedState = varcmd(_setSysvar(state, 10, 1000));

    test.equals(state.get("valueStack").peek(), 0, "uninitialized sysvar should read as 0");

    test.equals(updatedState.get("valueStack").peek(), 1000,
      "sysvar's value should be pushed to the valstack");

    test.done();
  },

  malformedSysvar : function(test) {
    var varcmd = parser.parseSysvar(sysvarStrings.malformed);

    test.equals(varcmd, undefined, "malformed sysvar should not parse into a function");
    test.done();
  }
};












