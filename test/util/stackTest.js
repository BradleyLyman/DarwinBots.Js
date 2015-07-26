var createStack = require('../../src/util/stack.js');

exports.testaCreate = function(test) {
  var stack = createStack();

  test.expect(3);
  test.ok(stack.stack, "expected stack to be present");
  test.ok(stack.push, "expected push function to exist");
  test.ok(stack.pop, "expected pop function to exist");
  test.done();
};

exports.testPop = function(test) {
  var valStack   = createStack(),
      logicStack = createStack(true);

  valStack.push(10);

  test.expect(3);
  test.equals(valStack.pop(), 10, "Expected top value to be popped");
  test.equals(valStack.pop(), 0, "expected default pop value to be zero");
  test.equals(logicStack.pop(), true, "expected default pop value to be true");
  test.done();
};

exports.testPush = function(test) {
  var valStack   = createStack(),
      shortStack = createStack(0, 3),
      i          = 0;

  valStack.push(10);

  test.expect(4);
  test.equals(valStack.length(), 1, "expected stack to have 1 value");
  test.equals(valStack.stack[0], 10, "expected value on stack to be the value which was pushed");

  for (i = 0; i < 100; i++) {
    valStack.push(i);
    shortStack.push(i);
  }

  test.equals(valStack.length(), 20, "Expected stack default max-size to equal 20");
  test.equals(shortStack.length(), 3, "Expected shortStack max-size to equal 3");
  test.done();
};
