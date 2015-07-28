var parser = require('../../src/dnainterpreter/parser.js');

var Token = function(valueString, lineNum) {
  return { value : valueString || "", lineNum : lineNum || 5 };
};

module.exports.testParseNumber = {
  validNumber : function(test) {
    var numberCmd = parser.parseNumber(Token("1253")).result;

    test.equals(numberCmd(), 1253, "parsed number function should return the number's value");
    test.done();
  },

  invalidNumber : function(test) {
    var result = parser.parseNumber(Token("aoeu"));

    test.ok(result.error, "Error expected");
    test.equals(result.error.payload.lineNum, 5, "Expected result payload to contain token");
    test.done();
  }
};
