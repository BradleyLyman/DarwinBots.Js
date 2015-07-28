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












