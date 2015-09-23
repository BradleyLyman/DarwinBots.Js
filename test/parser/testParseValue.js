var ValueParser = require('../../src/parser/parseValue.js'),
    ValueAst    = require('../../src/ast/value.js');


module.exports.literalTests = {
  validLiteral : function(test) {
    var validLiteralString = "94.234";
    var result = ValueParser.parseValue(validLiteralString);

    test.ok(!result.is_err(), "Expected value parsing to be successful");

    var valueNode = result.get_ok();
    test.equals(valueNode.value, 94.234);

    test.done();
  },

  invalidLiteral : function(test) {
    var invalidLiteralString = "394Ab";
    var result = ValueParser.parseValue(invalidLiteralString);

    test.ok(result.is_err(), "Expected value to parse incorrectly");
    test.done();
  }
};

module.exports.variableTests = {
  validVariable : function(test) {
    var validVariableString = "Eye1";
    var result = ValueParser.parseValue(validVariableString);

    test.ok(!result.is_err(), "Expected variable name to parse correctly");

    var valueNode = result.get_ok();
    test.equals(
        valueNode.value, validVariableString,
        "Expected variable name to match token string"
    );

    test.done();
  },

  invalidVariable : function(test) {
    var invalidVariableString = "1Eye";
    var result = ValueParser.parseValue(invalidVariableString);

    test.ok(result.is_err(), "expected variable name to fail to parse");
    test.done();
  }
};

