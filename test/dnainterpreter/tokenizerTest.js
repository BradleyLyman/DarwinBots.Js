var exports   = module.exports,
    tokenizer = require('../../src/dnainterpreter/tokenizer.js');

var testStrings = {
  splitOnWhitespace: "a \t b \n c \r\n d     e  \t"
};

exports.testSplitOnSpaces = function(test) {
  test.expect(1);

  var splitString = tokenizer(testStrings.splitOnWhitespace);
  test.equal(splitString.length, 5, "String not broken on whitespace");

  test.done();
};

