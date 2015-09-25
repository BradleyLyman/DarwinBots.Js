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
  var srcMgr = sourceManager(source.trim());

  var expr = parseBodyExpression(srcMgr);

  if (expr.is_err()) {
    return expr.get_err();
  }

  return expr.get_ok().toString();
};

var parseGene = function(srcMgr) {
  srcMgr.eatWhitespace();

  var condSlice = srcMgr.src.slice(srcMgr.cursor, srcMgr.cursor+4);
  if (condSlice !== 'cond') {
    return Err( "Expected keyword 'cond' and index: " + srcMgr.cursor );
  } else {
    srcMgr.cursor += 4;
  }

  srcMgr.eatWhitespace();
  var condExpression = parseCondExpression(srcMgr);
  if (condExpression.is_err()) {
    return condExpression;
  }

  srcMgr.eatWhitespace();
  var startSlice = srcMgr.src.slice(srcMgr.cursor, srcMgr.cursor+5);
  if (startSlice !== 'start') {
    return Err( "Expected keyword 'start' at index: " + srcMgr.cursor );
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
    return Err( "Expected keyword 'stop' at index: " + srcMgr.cursor );
  } else {
    srcMgr.cursor += 4;
  }

  return Ok( Ast.createGene(condExpression.get_ok(), bodyExprs) );
};

var parseCondExpression = function(srcMgr) {
  return parseAndPhrase(srcMgr).and_then(function(andPhrase) {
    if (srcMgr.peek() !== ';') {
      return Err( "Expected ';' at index: " + srcMgr.cursor );
    } else {
      srcMgr.cursor++;
      // no need to modify the and-phrase, so return nothing
    }
  });
};

var parseAndPhrase = function(srcMgr) {
  return parseOrPhrase(srcMgr).and_then(function(orPhrase) {
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
  if (srcMgr.peek() === '(') {
    srcMgr.cursor++;

    return parseAndPhrase(srcMgr).and_then(function(andPhrase) {
      if (srcMgr.peek() === ')') {
        srcMgr.cursor++;
      } else {
        return Err( "Expected ')' at index: " + srcMgr.cursor );
      }
    });
  } else {
    return parseBoolExpression(srcMgr);
  }
};

var parseBoolExpression = function(srcMgr) {
  return parseExpression(srcMgr)
    .and_then(function(expression1) {
      var idx       = srcMgr.cursor;
      var currSlice = srcMgr.src.slice(idx, idx+2);
      var results = currSlice.match(/(=)|(!=)|([\><]\=?)/);
      if (!results || results.index !== 0) {
        return Err( "Expected boolean operator at index: " + srcMgr.cursor );
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

        // A body expression must end with a ;
        if (srcMgr.next() === ';') {
          srcMgr.cursor++;
          return Ok( Ast.createBodyExpression(variable, expression) );
        } else {
          return Err( "Expected ';' at index: " + srcMgr.cursor );
        }
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
        return Err(
          "Expected a closing ')' at index " + (srcMgr.cursor+1)
        );
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

  var matcher = /((\d+)(\.\d*)?)|(\.\d*)/;

  var currSrc = srcMgr.src.slice(srcMgr.cursor);
  var results = currSrc.match(matcher);
  if (!results || results.index !== 0) {
    return Err( "Could not parse token as number" );
  }

  var value = +results[0];
  if (isNaN(value)) {
    return Err( "Could not parse token as number" );
  }

  srcMgr.cursor += results[0].length;
  return Ok( Ast.createNumber(value) );
};

var parseVariable = function(srcMgr) {
  srcMgr.eatWhitespace();

  var preMatch = /stop|and|or/;
  var matcher = /[a-zA-Z]+(\d+[a-zA-Z]*)*/;

  var currSrc = srcMgr.src.slice(srcMgr.cursor);

  var results = currSrc.match(preMatch);
  if (results && results.index === 0) {
    return Err( "Stop is a keyword and cannot be used as a variable" );
  }

  results = currSrc.match(matcher);
  if (!results || results.index !== 0) {
    return Err(
      "could not parse variable starting at index " + (srcMgr.cursor+1)
    );
  }

  srcMgr.cursor += results[0].length;
  return Ok( Ast.createVariable(results[0]) );
};










