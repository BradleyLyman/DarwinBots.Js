var Immutable = require('immutable'),
    tokenizer = require('../../src/dnainterpreter/tokenizer.js');

var validSource = "cond\n1 2 >\n3 2 <\n2 *.up =\n \n \nstart\n1 4 add\n3 mult\nadd\n.10 store\nstop";

module.exports.testSplitOnLines = function(test) {
  var tokenizedLines = tokenizer._private.splitOnLines(validSource);

  test.equals(tokenizedLines.length, 10, "validSource should split into 10 lines");
  test.equals(tokenizedLines[4].tokens[0], "start", "line 5 should be the start keyword");
  test.done();
};

module.exports.testLinesToTokenStack = function(test) {
  var tokenizedLines = tokenizer._private.splitOnLines(validSource),
      tokenStack     = tokenizer._private.linesToTokenStack(tokenizedLines);

  test.ok(Immutable.Stack.isStack(tokenStack));
  test.equals(tokenStack.peek().value, "stop", "the first token should be the last token in the source");
  test.done();
};
