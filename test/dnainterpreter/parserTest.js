var parser = require('../../src/dnainterpreter/parser.js');

module.exports.testCondExpr = function(test) {
  var stackOp = parser.condExpr("5"),
      boolOp  = parser.condExpr(">"),
      noOp    = parser.condExpr("start"),
      state   = parser.createState();

  test.expect(4);
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

  test.expect(1 + paramArray.length);
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










