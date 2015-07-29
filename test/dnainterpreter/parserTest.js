var parser    = require('../../src/dnainterpreter/parser.js'),
    tokenizer = require('../../src/dnainterpreter/tokenizer.js');

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
    test.equals(result.error.lineNum, 5, "Expected result payload to contain token");
    test.done();
  }
};

module.exports.testParseSysvar = {
  validSysvar : function(test) {
    var sysvarCmd = parser.parseSysvar(Token("*.nrg")).result,
        sysvars   = {};

    test.equals(sysvarCmd(sysvars), 0, "uninitialized sysvars equal 0");

    sysvars.nrg = 1000;

    test.equals(sysvarCmd(sysvars), 1000, "parsed sysvar command should return sysvar value");
    test.done();
  },

  invalidSysvar : function(test) {
    var result = parser.parseSysvar(Token(".nrg"));

    test.ok(result.error, "parsing an invalid sysvar token sohuld result in an error");
    test.done();
  }
};

module.exports.testParseSysvarAddr = {
  validSysvarAddr : function(test) {
    var sysvarCmd = parser.parseSysvarAddr(Token(".nrg")).result;

    test.equals(sysvarCmd(), "nrg", "Expected sysvar name to be returned");
    test.done();
  },

  invalidSysvarAddr : function(test) {
    var result = parser.parseSysvarAddr(Token("aoeu"));

    test.ok(result.error, "Expected an error when parsing invalid sysvar");
    test.done();
  }
};

var binOpTests = function(test, cmdString, testDescriptors) {
  testDescriptors.forEach(function(descriptor) {
    var cmd = parser.parseOperation(Token(cmdString)).result,
        res = cmd(descriptor.a, descriptor.b);

    test.equals(res, descriptor.result,
      "parsed " + cmdString + "(" + descriptor.a + ", " + descriptor.b +
      ") and got " + res + " but expected " + descriptor.result);
  });

  test.done();
};

module.exports.testParseOperation = {
  add : function(test) {
    binOpTests(test, "add", [
      { a : 100       , b : 1         , result : 101 } ,
      { a : undefined , b : 10        , result : 10 } ,
      { a : 10        , b : undefined , result : 10 } ,
      { a : "10"      , b : "aoeu"    , result : 0 }
    ]);
  },

  sub : function(test) {
    binOpTests(test, "sub", [
      { a : 100       , b : 1         , result : 99 } ,
      { a : undefined , b : 10        , result : -10 } ,
      { a : 10        , b : undefined , result : 10 } ,
      { a : "10"      , b : "aoeu"    , result : 0 }
    ]);
  },

  mult : function(test) {
    binOpTests(test, "mult", [
      { a : 100       , b : 1         , result : 100 } ,
      { a : undefined , b : 10        , result : 0 } ,
      { a : 10        , b : undefined , result : 0 } ,
      { a : "10"      , b : "aoeu"    , result : 0 }
    ]);
  },

  div : function(test) {
    binOpTests(test, "div", [
      { a : 100       , b : 1         , result : 100 } ,
      { a : 100       , b : 2         , result : 50 } ,
      { a : 3         , b : 5         , result : 1 } ,
      { a : undefined , b : 10        , result : 0 } ,
      { a : 10        , b : undefined , result : 0 } ,
      { a : "10"      , b : "aoeu"    , result : 0 }
    ]);
  },
};

var expressionStrings = {
  invalid : "1 3 add 56",
  simple  : "1 3 add",
  complex : "1 2 add 2 3 mult sub"
};

var _testExpressions = function(test, testDescriptors) {
  testDescriptors.forEach(function(descriptor) {
    var tokens       = tokenizer.tokenize(descriptor.source),
        result       = parser.parseExpression(tokens),
        cmd          = result.result;

    test.equals(cmd(), descriptor.result,
      "expected result to be " + descriptor.result + " but got " + cmd());
  });
  test.done();
};

module.exports.testParseExpression = {
  invalidExpression : function(test) {
    var tokens = tokenizer.tokenize(expressionStrings.invalid),
        result = parser.parseExpression(tokens);

    test.ok(result.error, "Expected an error when parsing a malformed expression");
    test.done();
  },

  validExpressions : function(test) {
    _testExpressions(test, [
      { source : expressionStrings.simple, result : 4 },
      { source : expressionStrings.complex, result : -3 }
    ]);
  }
};










