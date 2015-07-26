var parser = require('../../src/dnainterpreter/parser.js');

module.exports.testLiteral = function(test) {
  var strings = {
    valid : "  99 ",
    invalid : "ab9ou"
  };
  var state = parser.createState();

  test.expect(3);

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
    test.expect(4);
    binOpTest(test, [2, 10], "add", 12);
    binOpTest(test, [], "add", 0);
    test.done();
  },

  testSub : function(test) {
    test.expect(4);
    binOpTest(test, [2, 10], "sub", -8);
    binOpTest(test, [], "sub", 0);
    test.done();
  },

  testMul : function(test) {
    test.expect(4);
    binOpTest(test, [2, 10], "mul", 20);
    binOpTest(test, [], "mul", 0);
    test.done();
  },

  testDiv : function(test) {
    test.expect(6);
    binOpTest(test, [2, 10], "div", 0);
    binOpTest(test, [10, 2], "div", 5);
    binOpTest(test, [], "div", 0);
    test.done();
  },

  testUnknown : function(test) {
    test.expect(1);
    test.equals(parser.stackOp("aoeu"), undefined, "Unknown stack-ops should be unknown");
    test.done();
  }
};

module.exports.testBody = function(test) {
  var state = parser.createState();
  var code  = ["1", "2", "add", "5", "3", "mul", "sub", "stop"];

  parser.body(code)(state);

  test.expect(2);
  test.equals(state.valStack.length(), 1, "Stack should only have a length of 1 after this body executes");
  test.equals(state.valStack.pop(), -12, "First stack value should be -12");
  test.done();
};










