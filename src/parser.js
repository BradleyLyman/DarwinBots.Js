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
  srcMgr.eatWhitespace();

  var condSlice = srcMgr.src.slice(srcMgr.cursor, srcMgr.cursor+4);
  if (condSlice !== 'cond') {
    return Err( srcMgr.errAtCursor("Expected keyword 'cond'") );
  } else {
    srcMgr.cursor += 4;
  }

  var condExpression = Err( "Empty Cond" );

  srcMgr.eatWhitespace();
  var startSlice = srcMgr.src.slice(srcMgr.cursor, srcMgr.cursor+5);
  if (startSlice !== 'start') {
    condExpression = parseCondExpression(srcMgr);

    if (condExpression.is_err()) {
      return condExpression;
    }

    srcMgr.eatWhitespace();
    startSlice = srcMgr.src.slice(srcMgr.cursor, srcMgr.cursor+5);
    if (startSlice !== 'start') {
      return Err( srcMgr.errAtCursor("Keyword 'start' expected") );
    } else {
      srcMgr.cursor += 5;
    }
  } else {
    srcMgr.cursor += 5;
  }

  srcMgr.eatWhitespace();
  var bodyExprs = [];
  var bodyExpression = parseBodyExpression(srcMgr);
  while (!bodyExpression.is_err()) {
    bodyExprs.push(bodyExpression.get_ok());

    srcMgr.eatWhitespace();
    bodyExpression = parseBodyExpression(srcMgr);
  }

  srcMgr.eatWhitespace();
  var stopSlice = srcMgr.src.slice(srcMgr.cursor, srcMgr.cursor+4);
  if (stopSlice !== 'stop') {
    return bodyExpression;
  } else {
    srcMgr.cursor += 4;
  }

  return Ok( Ast.createGene(condExpression.get_ok(), bodyExprs) );
};

var parseCondExpression = function(srcMgr) {
  return parseAndPhrase(srcMgr);
};

var parseAndPhrase = function(srcMgr) {
  return parseOrPhrase(srcMgr).and_then(function(orPhrase) {
    srcMgr.eatWhitespace();

    var idx = srcMgr.cursor;
    var srcSlice = srcMgr.src.slice(idx, idx+3);

    if (srcSlice === 'and') {
      srcMgr.cursor += 3;
      return parseAndPhrase(srcMgr).and_then(function(andPhrase) {
        return Ok( Ast.createAndPhrase(orPhrase, andPhrase) );
      });
    }
  });
};

var parseOrPhrase = function(srcMgr) {
  return parseBoolGroup(srcMgr).and_then(function(boolGroup) {
    srcMgr.eatWhitespace();

    var idx = srcMgr.cursor;
    var srcSlice = srcMgr.src.slice(idx, idx+2);

    if (srcSlice === 'or') {
      srcMgr.cursor += 2;
      return parseOrPhrase(srcMgr).and_then(function(orPhrase) {
        return Ok( Ast.createOrPhrase(boolGroup, orPhrase) );
      });
    }
  });
};

var parseBoolGroup = function(srcMgr) {
  if (srcMgr.next() === '(') {
    srcMgr.cursor++;

    return parseAndPhrase(srcMgr).and_then(function(andPhrase) {
      if (srcMgr.next() === ')') {
        srcMgr.cursor++;
      } else {
        return Err( srcMgr.errAtCursor("Expected ')'") );
      }
    });
  } else {
    return parseBoolExpression(srcMgr);
  }
};

var parseBoolExpression = function(srcMgr) {
  return parseExpression(srcMgr)
    .and_then(function(expression1) {
      srcMgr.eatWhitespace();

      var idx       = srcMgr.cursor;
      var currSlice = srcMgr.src.slice(idx, idx+2);
      var results = currSlice.match(/(=)|(!=)|([\><]\=?)/);
      if (!results || results.index !== 0) {
        return Err( srcMgr.errAtCursor("Expected boolean operator") );
      }

      srcMgr.cursor += results[0].length;

      return parseExpression(srcMgr).and_then(function(expression2) {
        switch (results[0]) {
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
      // if <- then this is a proper body expression
      if (srcMgr.next() === '<') {
        srcMgr.cursor++;
      } else {
        return Err( srcMgr.errAtCursor("Expected '<'") );
      }

      if (srcMgr.next() === '-') {
        srcMgr.cursor++;
      } else {
        return Err( srcMgr.errAtCursor("Expected '-'") );
      }

      return parseExpression(srcMgr).and_then(function(expression) {
        return Ok( Ast.createBodyExpression(variable, expression) );
      });
    });
};

var parseExpression = function(srcMgr) {
  return parseTerm(srcMgr)
    .and_then(function(term1) {

      // if + then this is an add expr
      if (srcMgr.next() === '+') {
        srcMgr.cursor++;

        return parseExpression(srcMgr).and_then(function(term2) {
          return Ok( Ast.createAddExpr(term1, term2) );
        });
      }

      // if - then this is a sub expr
      if (srcMgr.next() === '-') {
        srcMgr.cursor++;

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
      // if * then this is a multiplication expression
      if (srcMgr.next() === '*') {
        srcMgr.cursor++;

        return parseTerm(srcMgr).and_then(function(factor2) {
          return Ok( Ast.createMulExpr(factor1, factor2) );
        });
      }

      // if / then this is a division expression
      if (srcMgr.next() === '/') {
        srcMgr.cursor++;

        return parseTerm(srcMgr).and_then(function(factor2) {
          return Ok( Ast.createDivExpr(factor1, factor2) );
        });
      }

      // otherwise this is just a factor so don't change anything
    });
};

var parseFactor = function(srcMgr) {
  return parseUnary(srcMgr).and_then(function(unary) {
    if (srcMgr.next() === '^') {
      srcMgr.cursor++;

      return parseFactor(srcMgr).and_then(function(factor) {
        return Ok( Ast.createPowExpr(unary, factor) );
      });
    }
  });
};

var parseUnary = function(srcMgr) {
  if (srcMgr.next() === '-') {
    srcMgr.cursor++;

    return parseUnary(srcMgr).and_then(function(unary) {
      return Ok( Ast.createUnaryMinus(unary) );
    });
  }

  return parseGroup(srcMgr);
};

var parseGroup = function(srcMgr) {
  if (srcMgr.next() === '(') {
    srcMgr.cursor++;

    return parseExpression(srcMgr).and_then(function(expr) {
      if (srcMgr.next() !== ')') {
        return Err( srcMgr.errAtCursor("Expected a closing ')'") );
      }

      srcMgr.cursor++;
    });
  }

  return parseNumber(srcMgr)
    .or_else(function() {
      return parseVariable(srcMgr);
    });
};

var parseNumber = function(srcMgr) {
  srcMgr.eatWhitespace();

  var matcher = /(((\d+)(\.\d*)?)|(\.\d*))(?![a-zA-Z])/;

  var currSrc = srcMgr.src.slice(srcMgr.cursor);
  var results = currSrc.match(matcher);
  if (!results || results.index !== 0) {
    return Err( srcMgr.errAtCursor("Expected number") );
  }

  var value = +results[0];
  if (isNaN(value)) {
    return Err( srcMgr.errAtCursor("Expected number") );
  }

  srcMgr.cursor += results[0].length;

  return Ok( Ast.createNumber(value) );
};

var parseVariable = function(srcMgr) {
  srcMgr.eatWhitespace();

  var preMatch = /stop|and|or|start/;
  var matcher = /[a-zA-Z]+(\d+[a-zA-Z]*)*/;

  var currSrc = srcMgr.src.slice(srcMgr.cursor);

  var results = currSrc.match(preMatch);
  if (results && results.index === 0) {
    return Err( srcMgr.errAtCursor("keyword used as variable") );
  }

  results = currSrc.match(matcher);
  if (!results || results.index !== 0) {
    return Err( srcMgr.errAtCursor("variable name expected") );
  }

  srcMgr.cursor += results[0].length;
  return Ok( Ast.createVariable(results[0]) );
};










