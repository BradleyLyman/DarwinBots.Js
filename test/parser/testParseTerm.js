var termParser = require('../../src/parser/parseTerm.js');

module.exports.positiveTerms = {
  parseLiteral : function(test) {
    var positiveLiteralString = "34.25";
    var result = termParser.parseTerm(positiveLiteralString);

    test.ok(!result.is_err(), "Expected literal to parse correctly");
    test.ok(!result.get_ok().isNegative, "Expected literal to be positive");

    test.done();
  },

  parseVariable : function(test) {
    var positiveVariableString = "Eye1";
    var result = termParser.parseTerm(positiveVariableString);

    test.ok(
      !result.is_err(),
      "Expected variable to parse as " + positiveVariableString
    );
    test.ok(!result.get_ok().isNegative, "Expected variable to be positive");
    test.done();
  }
};

module.exports.negativeTerms = {
  parseLiteral : function(test) {
    var negativeLiteralString = "-32.24";
    var result = termParser.parseTerm(negativeLiteralString);

    test.ok(!result.is_err(), "Expected negative literal to parse");

    var termNode = result.get_ok();

    test.ok(termNode.isNegative, "Expected literal to be negative");
    test.equal(
      termNode.value.value, 32.24,
      "Expected Value node to equal 32.24"
    );
    test.done();
  },

  parseVariable : function(test) {
    var negativeVariableString = "-Eye2";
    var result = termParser.parseTerm(negativeVariableString);

    test.ok(!result.is_err(), "Expected negative variable to parse");

    var termNode = result.get_ok();

    test.ok(termNode.isNegative, "expected variable to be negative");
    test.equal(
      termNode.value.value, "Eye2",
      "Expected Variable name to be correct"
    );
    test.done();
  }
};





