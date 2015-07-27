var parser = require('../../src/dnainterpreter/parser.js');

var geneBlocks = {
  condTrue     : ["cond", "1", "2", "<", "start", "4", "stop"],
  condFalse    : ["cond", "1", "2", ">", "start", "4", "stop"],
  lateCond     : ["1", "cond", "1", "2", "<", "start", "4", "stop"],
  end          : ["5", "100", "add", "end"],
  prematureEof : ["1", "add", "stop", "mul"]
};

module.exports.testGene = {
  prematureEof : function(test) {
    var gene = parser.gene(geneBlocks.prematureEof);

    test.equals(geneBlocks.prematureEof.length, 0, "should consume entire token stream");
    test.equals(gene, undefined, "premature eof should stop gene search");
    test.done();
  },

  testEndFound : function(test) {
    var gene = parser.gene(geneBlocks.end);

    test.equals(gene, undefined, "reaching end of file should stop gene search");
    test.done();
  },

  testLateCond : function(test) {
    var gene = parser.gene(geneBlocks.lateCond);
    test.ok(gene);
    test.done();
  },

  testCondTrue : function(test) {
    var gene  = parser.gene(geneBlocks.condTrue),
        state = parser.createState();

    test.ok(gene);

    gene(state);

    test.equals(state.valStack.stack[0], 4, "body should have executed");
    test.done();
  },

  testCondFalse : function(test) {
    var gene = parser.gene(geneBlocks.condFalse),
        state = parser.createState();

    test.ok(gene);

    gene(state);

    test.equals(state.valStack.stack.length, 0, "body should not have executed");
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
    var block = parser.condBlock(condBlocks.validEmptyBlock);

    test.ok(block, "block should be a function");
    test.equals(condBlocks.validEmptyBlock[0], "1", "start should be stripped from token stream");
    test.done();
  },

  testValidEndBlock : function(test) {
    var block = parser.condBlock(condBlocks.validEndBlock);

    test.equals(block, undefined, "premature end should result in a no-op");
    test.equals(condBlocks.validEndBlock[0], "end", "End token should be all that remains in token stream");
    test.done();
  },

  testValidNoOpBlock : function(test) {
    var block = parser.condBlock(condBlocks.validNoOpBlock);

    test.equals(block, undefined, "stop token should result in a no-op");
    test.equals(condBlocks.validNoOpBlock.length, 0, "all tokens should be consumed");
    test.done();
  },

  testValidBlock : function(test) {
    var block = parser.condBlock(condBlocks.validBlock),
        state = parser.createState();

    test.equals(condBlocks.validBlock.length, 0, "condBlock did not consume all tokens when parsing");
    test.ok(block, "block was not processed properly");
    block(state);

    test.equals(state.boolStack.length(), 2, "both conditional statements should leave values on the stack");
    test.equals(state.valStack.length(), 0, "all values should have been used");
    test.ok(state.boolStack.pop(), "second conditional should be true");
    test.ok(!state.boolStack.pop(), "first conditional should be false");
    test.done();
  },

  testInvalidStart : function(test) {
    var block = parser.condBlock(condBlocks.invalidStart);

    test.equals(block, undefined, "Block should be undefined");
    test.done();
  },

  testUnexpectedEof : function(test) {
    var block = parser.condBlock(condBlocks.unexpectedEof);

    test.equals(block, undefined, "UnexpectedEof should result in a no-op");
    test.done();
  },

  testInvalidContinuation : function(test) {
    var block = parser.condBlock(condBlocks.invalidContinuation);

    test.equals(block, undefined, "InvalidContinuation should be undefined");
    test.equals(condBlocks.invalidContinuation.length, 1, "second cond token should remain in stream");
    test.equals(condBlocks.invalidContinuation[0], "cond", "second cond token should remain in stream");
    test.done();
  },
};


module.exports.testCondExpr = function(test) {
  var stackOp = parser.condExpr("5"),
      boolOp  = parser.condExpr(">"),
      noOp    = parser.condExpr("start"),
      state   = parser.createState();

  test.ok(stackOp, "StackOp expected to return a function");
  test.ok(boolOp, "BoolOp expected to return a function");
  test.equals(noOp, undefined, "noOp expected to be undefined");

  stackOp(state);
  boolOp(state);
  test.equals(state.boolStack.pop(), false, "Expected value to be false");

  test.done();
};

var boolTest = function(test, op, paramArray) {
  var boolOp = parser.boolOp(op);

  test.ok(boolOp, "Expected boolOp, " + op + ", to be a function");

  paramArray.forEach(function(testObj) {
    var state = parser.createState();
    state.valStack.push(testObj.vals[0]);
    state.valStack.push(testObj.vals[1]);

    boolOp(state);

    test.equals(state.boolStack.pop(), testObj.expected,
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

module.exports.testLiteral = function(test) {
  var strings = {
    valid : "  99 ",
    invalid : "ab9ou"
  };
  var state = parser.createState();

  parser.literal(strings.valid)(state);

  test.equals(state.valStack.length(), 1, "Value not pushed to the stack");
  test.equals(state.valStack.pop(), 99, "Value parsed, but the wrong number was put on the stack");

  test.equals(parser.literal(strings.invalid), undefined);

  test.done();
};


var binOpTest = function(test, stackVals, op, value) {
  var state = parser.createState();

  stackVals.forEach(function(val) {
    state.valStack.push(val);
  });

  parser.stackOp(op)(state);

  test.equals(state.valStack.length(), 1);
  test.equals(state.valStack.pop(), value);
};

module.exports.testStackOp = {
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
    test.equals(parser.stackOp("aoeu"), undefined, "Unknown stack-ops should be unknown");
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
    var block = parser.body(bodyBlocks.prematureEof);

    test.ok(block, "block should be a valid function");
    test.done();
  },

  testPrematureBody : function(test) {
    var block = parser.body(bodyBlocks.prematureBody);

    test.ok(block, "block should be a valid function");
    test.equals(bodyBlocks.prematureBody[0], "start");
    test.done();
  },

  testPrematureCond : function(test) {
    var block = parser.body(bodyBlocks.prematureCond);

    test.ok(block, "block should be a valid function");
    test.equals(bodyBlocks.prematureCond[0], "cond");
    test.done();
  },

  testValidBlock : function(test) {
    var state = parser.createState();

    parser.body(bodyBlocks.validBlock)(state);

    test.equals(state.valStack.length(), 1, "Stack should only have a length of 1 after this body executes");
    test.equals(state.valStack.pop(), -12, "First stack value should be -12");
    test.done();
  },

  testPrematureEnd : function(test) {
    var block = parser.body(bodyBlocks.prematureEnd),
        state = parser.createState();

    test.ok(block, "body should be processed without issue");

    block(state);
    test.equals(state.valStack.stack[0], 1,
      "value stack should hold last op's value: 1 expceted but " + state.valStack[0] + " found");
    test.done();
  }
};














