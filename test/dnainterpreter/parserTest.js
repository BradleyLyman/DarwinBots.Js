var parser    = require('../../src/dnainterpreter/parser.js'),
    tokenizer = require('../../src/dnainterpreter/tokenizer.js');

var Token = function(valueString, lineNum) {
  return { value : valueString || "", lineNum : lineNum || 5 };
};

module.exports.testParseNumber = {
  validNumber : function(test) {
    var numberCmd = parser._private.parseNumber(Token("1253")).get_ok();

    test.equals(numberCmd(), 1253, "parsed number function should return the number's value");
    test.done();
  },

  invalidNumber : function(test) {
    var result = parser._private.parseNumber(Token("aoeu"));

    test.ok(result.is_err(), "Error expected");
    test.equals(result.get_err().lineNum, 5, "Expected result payload to contain token");
    test.done();
  }
};

module.exports.testParseSysvar = {
  validSysvar : function(test) {
    var sysvarCmd = parser._private.parseSysvar(Token("*.nrg")).get_ok(),
        sysvars   = {};

    test.equals(sysvarCmd(sysvars), 0, "uninitialized sysvars equal 0");

    sysvars.nrg = 1000;

    test.equals(sysvarCmd(sysvars), 1000, "parsed sysvar command should return sysvar value");
    test.done();
  },

  invalidSysvar : function(test) {
    var result = parser._private.parseSysvar(Token(".nrg"));

    test.ok(result.is_err(), "parsing an invalid sysvar token sohuld result in an error");
    test.done();
  }
};

module.exports.testParseSysvarAddr = {
  validSysvarAddr : function(test) {
    var sysvarCmd = parser._private.parseSysvarAddr(Token(".nrg")).get_ok();

    test.equals(sysvarCmd(), "nrg", "Expected sysvar name to be returned");
    test.done();
  },

  invalidSysvarAddr : function(test) {
    var result = parser._private.parseSysvarAddr(Token("aoeu"));

    test.ok(result.is_err(), "Expected an error when parsing invalid sysvar");
    test.done();
  }
};

var binOpTests = function(test, cmdString, testDescriptors) {
  testDescriptors.forEach(function(descriptor) {
    var cmd = parser._private.parseOperation(Token(cmdString))
                .or_else(function() {
                  return parser._private.parseBoolOperation(Token(cmdString));
                }).get_ok(),
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

module.exports.testParseBoolOperation = {
  greater : function(test) {
    binOpTests(test, ">", [
      { a : 100       , b : 1         , result : true },
      { a : 100       , b : 100       , result : false },
      { a : 100       , b : 101       , result : false },
      { a : undefined , b : -1        , result : true },
      { a : 10        , b : undefined , result : true }
    ]);
  },

  less : function(test) {
    binOpTests(test, "<", [
      { a : 100       , b : 1         , result : false },
      { a : 100       , b : 100       , result : false },
      { a : 100       , b : 101       , result : true },
      { a : undefined , b : -1        , result : false },
      { a : 10        , b : undefined , result : false }
    ]);
  },

  equal : function(test) {
    binOpTests(test, "=", [
      { a : 100       , b : 1         , result : false },
      { a : 100       , b : 100       , result : true },
      { a : 100       , b : 101       , result : false },
      { a : undefined , b : -1        , result : false },
      { a : 10        , b : undefined , result : false }
    ]);
  },

  notEqual : function(test) {
    binOpTests(test, "!=", [
      { a : 100       , b : 1         , result : true },
      { a : 100       , b : 100       , result : false },
      { a : 100       , b : 101       , result : true },
      { a : undefined , b : -1        , result : true },
      { a : 10        , b : undefined , result : true }
    ]);
  },

  greaterOrEqual : function(test) {
    binOpTests(test, ">=", [
      { a : 100       , b : 1         , result : true },
      { a : 100       , b : 100       , result : true },
      { a : 100       , b : 101       , result : false },
      { a : undefined , b : -1        , result : true },
      { a : 10        , b : undefined , result : true }
    ]);
  },

  lessOrEqual : function(test) {
    binOpTests(test, "<=", [
      { a : 100       , b : 1         , result : false },
      { a : 100       , b : 100       , result : true },
      { a : 100       , b : 101       , result : true },
      { a : undefined , b : -1        , result : false },
      { a : 10        , b : undefined , result : false }
    ]);
  },
};

var expressionStrings = {
  invalid     : "1 3 add 56",
  simple      : "1 3 add",
  complex     : "1 2 add 2 3 mult sub",
  readSysvar  : "*.nrg 5 mult",
  storeSysvar : "10 .up store",
  boolExpr    : "10 11 <"
};

var _testExpressions = function(test, testDescriptors) {
  testDescriptors.forEach(function(descriptor) {
    var tokens       = tokenizer.tokenize(descriptor.source),
        result       = parser._private.parseExpression(tokens),
        cmd          = result.get_ok().dnaFunction;

    test.equals(cmd(), descriptor.result,
      "expected result to be " + descriptor.result + " but got " + cmd());
  });
  test.done();
};

module.exports.testParseExpression = {
  invalidExpression : function(test) {
    var tokens = tokenizer.tokenize(expressionStrings.invalid),
        result = parser._private.parseExpression(tokens);

    test.ok(result.get_err(), "Expected an error when parsing a malformed expression");
    test.done();
  },

  validExpressions : function(test) {
    _testExpressions(test, [
      { source : expressionStrings.simple, result : 4 },
      { source : expressionStrings.complex, result : -3 },
      { source : expressionStrings.boolExpr, result : true }
    ]);
  },

  readSysvarExpression : function(test)  {
    var tokens = tokenizer.tokenize(expressionStrings.readSysvar),
        cmd    = parser._private.parseExpression(tokens).get_ok().dnaFunction;

    test.equals(cmd({ nrg : 10}), 50, "Expected expression to equal nrg * 5");
    test.done();
  },

  storeSysvar : function(test) {
    var tokens  = tokenizer.tokenize(expressionStrings.storeSysvar),
        cmd     = parser._private.parseExpression(tokens).get_ok().dnaFunction,
        sysvars = {};

    test.equals(cmd(sysvars), 10, "sysvar value should be returned from store expression");
    test.equals(sysvars.up, 10, "value should be saved to the sysvar");
    test.done();
  }
};

var bodySources = {
  noStop : "start 1 3 add .up store",
  noStart : "1 3 add .up store stop",
  oneExpression : "start 1 .up store stop"
};

var bodyTests = function(test, testDescriptors) {
  testDescriptors.forEach(function(descriptor) {
    var tokens  = tokenizer.tokenize(descriptor.source),
        result  = parser._private.parseBody(tokens),
        sysvars = {};

    test.ok(!result.is_err(),
      "Failed to parse body with source: " + descriptor.source + "\n" +
      "Error was: " + result.get_err());

    result.get_ok().dnaFunction(sysvars);
    Object.getOwnPropertyNames(descriptor.expectedSysvars)
      .forEach(function(sysvarName) {
        test.equals(descriptor.expectedSysvars[sysvarName], sysvars[sysvarName],
          "Unexpected value found in ." + sysvarName + " expected " +
          descriptor.expectedSysvars[sysvarName] + " but got " + sysvars[sysvarName] +
          "\n " + descriptor.source);
      });
  });
  test.done();
};

module.exports.testParseBody = {
  noStop : function(test) {
    var tokens = tokenizer.tokenize(bodySources.noStop),
        result = parser._private.parseBody(tokens);

    test.ok(result.is_err(), "expected an error when parsing the body");
    test.done();
  },

  noStart : function(test) {
    var tokens = tokenizer.tokenize(bodySources.noStart),
        result = parser._private.parseBody(tokens);

    test.ok(result.get_err(), "Expected error when parsing body");
    test.done();
  },

  validBodies : function(test) {
    bodyTests(test, [
      { source : "start 1 .up store 3 .shoot store stop",
        expectedSysvars : { up : 1, shoot : 3}
      },
      { source : "start 10 .up store 3 *.up mult .down store stop",
        expectedSysvars : { up : 10, down : 30 }
      },
      { source : "start 5 .up add .down store 1 6 mult .dx store stop",
        expectedSysvars : { down : 5, dx : 6 }
      },
      { source : "start 5 *.up add .down store stop",
        expectedSysvars : { down : 5 }
      },
    ]);
  }
};

var condSources = {
  noStart : "cond 1 2 < 4 *.up add 3 >",
  noCond  : "1 2 < 4 *.up add 3 > start"
};

var condTests = function(test, testDescriptors) {
  testDescriptors.forEach(function(descriptor) {
    var tokens  = tokenizer.tokenize(descriptor.source),
        result  = parser._private.parseCond(tokens),
        sysvars = descriptor.sysvars;

    test.ok(!result.is_err(),
      "Failed to parse cond with source: " + descriptor.source + "\n" +
      "Error was: " + result.get_err());

    test.equals(result.get_ok().dnaFunction(sysvars), descriptor.result,
      "Expected " + descriptor.result + " but got " + !descriptor.result +
      "\n source: " + descriptor.source);
  });
  test.done();
};

module.exports.testParseCond = {
  noStop : function(test) {
    var tokens = tokenizer.tokenize(condSources.noStart),
        result = parser._private.parseCond(tokens);

    test.ok(result.is_err(), "expected an error when parsing cond");
    test.done();
  },

  noStart : function(test) {
    var tokens = tokenizer.tokenize(condSources.noCond),
        result = parser._private.parseCond(tokens);

    test.ok(result.is_err(), "Expected error when parsing cond");
    test.done();
  },

  validConds : function(test) {
    condTests(test, [
      { source : "cond 1 2 < start", result : true },
      { source  : "cond 3 *.up = 1 *.down = start",
        sysvars : { up : 3, down : 1 },
        result  : true
      },
      { source : "cond 1 1 = 2 3 = start", result : false }
    ]);
  }
};

var geneSources = {
  activeGene : "cond 1 2 < 5 3 2 sub > start 100 .up store -20 .tieval store stop",
  inactiveGene : "cond 1 2 < 5 3 2 add > start 100 .up store -20 .tieval store stop",
};

module.exports.testParseGene = {
  activeGene : function(test) {
    var tokens = tokenizer.tokenize(geneSources.activeGene),
        geneCmd = parser._private.parseGene(tokens).get_ok().dnaFunction,
        sysvars = {};

    geneCmd(sysvars);
    test.equals(sysvars.up, 100, "expected up to have a value of 100 but found " + sysvars.up);
    test.equals(sysvars.tieval, -20, "expected tieval to have a value of -20 but found " + sysvars.tieval);
    test.done();
  },

  inactiveGene : function(test) {
    var tokens = tokenizer.tokenize(geneSources.inactiveGene),
        geneCmd = parser._private.parseGene(tokens).get_ok().dnaFunction,
        sysvars = { up : 10, tieval : 33 };

    geneCmd(sysvars);
    test.equals(sysvars.up, 10, "expected up to have a value of 10 but found " + sysvars.up);
    test.equals(sysvars.tieval, 33, "expected tieval to have a value of 33 but found " + sysvars.tieval);
    test.done();
  }
};




