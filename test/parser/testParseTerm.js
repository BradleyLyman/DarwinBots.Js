var termParser = require('../../src/parser/parseTerm.js');

module.exports.positiveTerms = {
  parseLiteral : function(test) {
    var positiveLiteralString = "34.25";
    var result = termParser.parseTerm(positiveLiteralString);

    test.ok(!result.is_err(), "Expected literal to parse correctly");
    test.ok(!result.get_ok().isNegative, "Expected literal to be positive");

    test.done();
  }
};
