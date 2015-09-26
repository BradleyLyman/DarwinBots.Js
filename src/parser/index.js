var Ast    = require('./ast.js'),
    sourceManager = require('./sourceManager.js'),
    Result = require('object-result'),
    Ok     = Result.Ok,
    Err    = Result.Err;

/**
 * Parses the given string into a token representing the number.
 * @param {String} source - String to parse.
 * @return Result -- Ok payload is just the number.
 **/
module.exports = function(source) {
  var srcMgr = sourceManager(source);

  var expr = parseGene(srcMgr);

  if (expr.is_err()) {
    return expr.get_err();
  }

  return expr.get_ok().toString();
};

var parseGene = function(srcMgr) {
  return srcMgr
    .expect('cond')
    .and_then(function() {
      // parse cond block, checking first for an empty block
      if (srcMgr.expect('start').is_err()) {
        return parseCondExpression(srcMgr)
          .and_then(function(condExpr) {
            return srcMgr.expect('start').and_then(function() {
              return Ok( condExpr );
            });
          });
      } else {
        return Ok( Ast.createEmptyCond() );
      }
    })
    .and_then(function(condExpression) {
      // parse the body expressions
      var bodyExprs = [];
      var bodyExpression = parseBodyExpression(srcMgr);
      while (!bodyExpression.is_err()) {
        bodyExprs.push(bodyExpression.get_ok());

        bodyExpression = parseBodyExpression(srcMgr);
      }

      // catches unclosed paren errors using the paren counter
      if (srcMgr.expect('stop').is_err() || srcMgr.parenCtr !== 0) {
        return bodyExpression;
      }

      return Ok( Ast.createGene(condExpression, bodyExprs) );
    });
};

var parseCondExpression = function(srcMgr) {
  return parseAndPhrase(srcMgr);
};

var parseAndPhrase = function(srcMgr) {
  return parseOrPhrase(srcMgr)
    .and_then(function(orPhrase) {
      if(srcMgr.expect('and').is_err()) {
        return Ok( orPhrase );
      } else {
        return parseAndPhrase(srcMgr)
          .and_then(function(andPhrase) {
            return Ok( Ast.createAndPhrase(orPhrase, andPhrase) );
          });
      }
    });
};

var parseOrPhrase = function(srcMgr) {
  return parseBoolGroup(srcMgr)
    .and_then(function(boolGroup) {
      if (srcMgr.expect('or').is_err()) {
        return Ok(boolGroup);
      } else {
        return parseOrPhrase(srcMgr)
          .and_then(function(orPhrase) {
            return Ok( Ast.createOrPhrase(boolGroup, orPhrase) );
          });
      }
    });
};

var parseBoolGroup = function(srcMgr) {
  if (srcMgr.expect(/\(/, '(').is_err()) {
    return parseBoolExpression(srcMgr);
  } else {
    return parseAndPhrase(srcMgr)
      .and_then(function(andPhrase) {
        return srcMgr
          .expect(/\)/, ')')
          .and_then(function() {
            return Ok( andPhrase );
          });
      });
  }
};

var parseBoolExpression = function(srcMgr) {
  return parseExpression(srcMgr)
    .and_then(function(expression1) {
      var boolOp = srcMgr.expect(/(=)|(!=)|([\><]\=?)/, 'boolean operation');
      if (boolOp.is_err()) {
        return boolOp;
      }

      return parseExpression(srcMgr).and_then(function(expression2) {
        switch (boolOp.get_ok()) {
          case '=':
            return Ok( Ast.createEqualExpr(expression1, expression2) );

          case '<':
            return Ok( Ast.createLessExpr(expression1, expression2) );

          case '>':
            return Ok( Ast.createGreaterExpr(expression1, expression2) );

          case '>=':
            return Ok( Ast.createGEExpr(expression1, expression2) );

          case '<=':
            return Ok( Ast.createLEExpr(expression1, expression2) );

          case '!=':
            return Ok( Ast.createNEExpr(expression1, expression2) );
        }
      });
  });
};

var parseBodyExpression = function(srcMgr) {
  return parseVariable(srcMgr)
    .and_then(function(variable) {
      return srcMgr
        .expect('<-')
        .and_then(function() {
          return parseExpression(srcMgr).and_then(function(expression) {
            return Ok( Ast.createBodyExpression(variable, expression) );
          });
        });
    });
};

var parseExpression = function(srcMgr) {
  return parseTerm(srcMgr)
    .and_then(function(term1) {
      if (!srcMgr.expect(/\+/, '+').is_err()) {
        return parseExpression(srcMgr).and_then(function(term2) {
          return Ok( Ast.createAddExpr(term1, term2) );
        });
      }

      if (!srcMgr.expect(/\-/, '-').is_err()) {
        return parseExpression(srcMgr).and_then(function(term2) {
          return Ok( Ast.createSubExpr(term1, term2) );
        });
      }

      // otherwise this is just a term, so no modification
    });
};

var parseTerm = function(srcMgr) {
  return parseFactor(srcMgr)
    .and_then(function(factor1) {
      if (!srcMgr.expect(/\*/, '*').is_err()) {
        return parseTerm(srcMgr).and_then(function(factor2) {
          return Ok( Ast.createMulExpr(factor1, factor2) );
        });
      }

      if (!srcMgr.expect(/\//, '/').is_err()) {
        return parseTerm(srcMgr).and_then(function(factor2) {
          return Ok( Ast.createDivExpr(factor1, factor2) );
        });
      }

      // otherwise this is just a factor so don't change anything
    });
};

var parseFactor = function(srcMgr) {
  return parseUnary(srcMgr).and_then(function(unary) {
    if (!srcMgr.expect(/\^/, '^').is_err()) {
      return parseFactor(srcMgr).and_then(function(factor) {
        return Ok( Ast.createPowExpr(unary, factor) );
      });
    }
  });
};

var parseUnary = function(srcMgr) {
  if (!srcMgr.expect(/\-/, '-').is_err()) {
    return parseUnary(srcMgr).and_then(function(unary) {
      return Ok( Ast.createUnaryMinus(unary) );
    });
  }

  return parseGroup(srcMgr);
};

var parseGroup = function(srcMgr) {
  if (srcMgr.expect(/\(/, '(').is_err()) {
    return parseNumber(srcMgr)
      .or_else(function() {
        return parseVariable(srcMgr);
      });
  } else {
    srcMgr.parenCtr += 1;
    return parseExpression(srcMgr)
      .and_then(function(expr) {
      return srcMgr.expect(/\)/, ')').and_then(function() {
        srcMgr.parenCtr -= 1;
        return Ok( expr );
      });
    });
  }
};

var parseNumber = function(srcMgr) {
  var matcher = /(((\d+)(\.\d*)?)|(\.\d*))(?![a-zA-Z])/;
  var numResult = srcMgr.expect(matcher, 'number');

  if (numResult.is_err()) {
    return numResult;
  }

  var value = +numResult.get_ok();
  if (isNaN(value)) {
    return Err( srcMgr.errAtCursor("Expected valid number") );
  }

  return Ok( Ast.createNumber(value) );
};

var parseVariable = function(srcMgr) {
  var keywordMatch = /stop|and|or|start|cond/;
  var matcher = /[a-zA-Z]+(\d+[a-zA-Z]*)*/;

  return srcMgr
    .expectNot(keywordMatch, 'keyword')
    .and_then(function() {
      return srcMgr.expect(matcher, 'variable');
    })
    .and_then(function(varName) {
      return Ok( Ast.createVariable(varName) );
    });
};










