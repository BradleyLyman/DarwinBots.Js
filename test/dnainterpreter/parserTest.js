var parser = require('../../src/dnainterpreter/parser.js');

module.exports.testLiteral = function(test) {
  var strings = {
    valid : "  99.03 ",
    invalid : "ab9ou"
  };
  var stack = [];

  test.expect(3);

  parser.literal(strings.valid)(stack);

  test.equals(stack.length, 1, "Value not pushed to the stack");
  test.equals(stack[0], 99.03, "Value parsed, but the wrong number was put on the stack");

  test.equals(parser.literal(strings.invalid), undefined);

  test.done();
};


var binOpTest = function(test, stack, op, value) {
  parser.stackOp(op)(stack);

  test.equals(stack.length, 1);
  test.equals(stack[0], value);
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
    test.expect(4);
    binOpTest(test, [2, 10], "div", 0.2);
    binOpTest(test, [], "div", 0.0);
    test.done();
  },

  testUnknown : function(test) {
    test.expect(1);
    test.equals(parser.stackOp("aoeu"), undefined, "Unknown stack-ops should be unknown");
    test.done();
  }
};












