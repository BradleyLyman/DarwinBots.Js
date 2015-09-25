var Ast    = require('./ast.js'),
    Result = require('object-result'),
    Ok     = Result.Ok,
    Err    = Result.Err;

/**
 * Parses the given string into a token representing the number.
 * @param {String} source - String to parse.
 * @return Result -- Ok payload is just the number.
 **/
module.exports = function(source) {
  var cleanSource = source.split(/\s+/)
    .filter(function(tkn) { return tkn !== ''; })
    .join('');

  var srcDesc = {
    cursorIndex : 0,
    src         : cleanSource,
    peek        : function() {
      return this.src[this.cursorIndex];
    }
  };

  var expr = parseCondExpression(srcDesc);

  if (expr.is_err()) {
    return expr.get_err();
  }

  return expr.get_ok().toString();
};

var parseGene = function(srcDesc) {
  var startSlice = srcDesc.src.slice(srcDesc.cursorIndex, srcDesc.cursorIndex+5);
  if (startSlice !== 'start') {
    return Err( "Expected keyword 'start' at index: " + srcDesc.cursorIndex );
  } else {
    srcDesc.cursorIndex += 5;
  }

  var bodyExprs = [];
  var bodyExpression = parseBodyExpression(srcDesc);
  while (!bodyExpression.is_err()) {
    bodyExprs.push(bodyExpression.get_ok());

    bodyExpression = parseBodyExpression(srcDesc);
  }

  var stopSlice = srcDesc.src.slice(srcDesc.cursorIndex, srcDesc.cursorIndex+4);
  if (stopSlice !== 'stop') {
    return Err( "Expected keyword 'stop' at index: " + srcDesc.cursorIndex );
  } else {
    srcDesc.cursorIndex += 4;
  }

  return Ok( Ast.createGene(bodyExprs) );
};

var parseCondExpression = function(srcDesc) {
  return parseAndPhrase(srcDesc).and_then(function(andPhrase) {
    if (srcDesc.peek() !== ';') {
      return Err( "Expected ';' at index: " + srcDesc.cursorIndex );
    } else {
      srcDesc.cursorIndex++;
      // no need to modify the and-phrase, so return nothing
    }
  });
};

var parseAndPhrase = function(srcDesc) {
  return parseOrPhrase(srcDesc).and_then(function(orPhrase) {
    var idx = srcDesc.cursorIndex;
    var srcSlice = srcDesc.src.slice(idx, idx+3);

    if (srcSlice === 'and') {
      srcDesc.cursorIndex += 3;
      return parseAndPhrase(srcDesc).and_then(function(andPhrase) {
        return Ok( Ast.createAndPhrase(orPhrase, andPhrase) );
      });
    }
  });
};

var parseOrPhrase = function(srcDesc) {
  return parseBoolGroup(srcDesc).and_then(function(boolGroup) {
    var idx = srcDesc.cursorIndex;
    var srcSlice = srcDesc.src.slice(idx, idx+2);

    if (srcSlice === 'or') {
      srcDesc.cursorIndex += 2;
      return parseOrPhrase(srcDesc).and_then(function(orPhrase) {
        return Ok( Ast.createOrPhrase(boolGroup, orPhrase) );
      });
    }
  });
};

var parseBoolGroup = function(srcDesc) {
  if (srcDesc.peek() === '(') {
    srcDesc.cursorIndex++;

    return parseAndPhrase(srcDesc).and_then(function(andPhrase) {
      if (srcDesc.peek() === ')') {
        srcDesc.cursorIndex++;
      } else {
        return Err( "Expected ')' at index: " + srcDesc.cursorIndex );
      }
    });
  } else {
    return parseBoolExpression(srcDesc);
  }
};

var parseBoolExpression = function(srcDesc) {
  return parseExpression(srcDesc)
    .and_then(function(expression1) {
      var idx       = srcDesc.cursorIndex;
      var currSlice = srcDesc.src.slice(idx, idx+2);
      var results = currSlice.match(/(=)|(!=)|([\><]\=?)/);
      if (!results || results.index !== 0) {
        return Err( "Expected boolean operator at index: " + srcDesc.cursorIndex );
      }

      srcDesc.cursorIndex += results[0].length;

      return parseExpression(srcDesc).and_then(function(expression2) {
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

var parseBodyExpression = function(srcDesc) {
  return parseVariable(srcDesc)
    .and_then(function(variable) {
      // if <- then this is a proper body expression
      if (srcDesc.peek() === '<') {
        srcDesc.cursorIndex++;
      } else {
        return Err( "Expected '<' at index: " + srcDesc.cursorIndex );
      }

      if (srcDesc.peek() === '-') {
        srcDesc.cursorIndex++;
      } else {
        return Err( "Expected '-' at index: " + srcDesc.cursorIndex );
      }

      return parseExpression(srcDesc).and_then(function(expression) {

        // A body expression must end with a ;
        if (srcDesc.peek() === ';') {
          srcDesc.cursorIndex++;
          return Ok( Ast.createBodyExpression(variable, expression) );
        } else {
          return Err( "Expected ';' at index: " + srcDesc.cursorIndex );
        }
      });
    });
};

var parseExpression = function(srcDesc) {
  return parseTerm(srcDesc)
    .and_then(function(term1) {
      // if + then this is an add expr
      if (srcDesc.peek() === '+') {
        srcDesc.cursorIndex++;

        return parseExpression(srcDesc).and_then(function(term2) {
          return Ok( Ast.createAddExpr(term1, term2) );
        });
      }

      // if - then this is a sub expr
      if (srcDesc.peek() === '-') {
        srcDesc.cursorIndex++;

        return parseExpression(srcDesc).and_then(function(term2) {
          return Ok( Ast.createSubExpr(term1, term2) );
        });
      }

      // otherwise this is just a term, so no modification
    });
};

var parseTerm = function(srcDesc) {
  return parseFactor(srcDesc)
    .and_then(function(factor1) {
      // if * then this is a multiplication expression
      if (srcDesc.peek() === '*') {
        srcDesc.cursorIndex++;

        return parseTerm(srcDesc).and_then(function(factor2) {
          return Ok( Ast.createMulExpr(factor1, factor2) );
        });
      }

      // if / then this is a division expression
      if (srcDesc.peek() === '/') {
        srcDesc.cursorIndex++;

        return parseTerm(srcDesc).and_then(function(factor2) {
          return Ok( Ast.createDivExpr(factor1, factor2) );
        });
      }

      // otherwise this is just a factor so don't change anything
    });
};

var parseFactor = function(srcDesc) {
  return parseUnary(srcDesc).and_then(function(unary) {
    if (srcDesc.peek() === '^') {
      srcDesc.cursorIndex++;

      return parseFactor(srcDesc).and_then(function(factor) {
        return Ok( Ast.createPowExpr(unary, factor) );
      });
    }
  });
};

var parseUnary = function(srcDesc) {
  if (srcDesc.peek() === '-') {
    srcDesc.cursorIndex++;

    return parseUnary(srcDesc).and_then(function(unary) {
      return Ok( Ast.createUnaryMinus(unary) );
    });
  }

  return parseGroup(srcDesc);
};

var parseGroup = function(srcDesc) {
  if (srcDesc.peek() === '(') {
    srcDesc.cursorIndex++;

    return parseExpression(srcDesc).and_then(function(expr) {
      if (srcDesc.peek() !== ')') {
        return Err(
          "Expected a closing ')' at index " + (srcDesc.cursorIndex+1)
        );
      }

      srcDesc.cursorIndex++;
    });
  }

  return parseNumber(srcDesc)
    .or_else(function() {
      return parseVariable(srcDesc);
    });
};

var parseNumber = function(srcDesc) {
  var matcher = /((\d+)(\.\d*)?)|(\.\d*)/;

  var currSrc = srcDesc.src.slice(srcDesc.cursorIndex);
  var results = currSrc.match(matcher);
  if (!results || results.index !== 0) {
    return Err( "Could not parse token as number" );
  }

  var value = +results[0];
  if (isNaN(value)) {
    return Err( "Could not parse token as number" );
  }

  srcDesc.cursorIndex += results[0].length;
  return Ok( Ast.createNumber(value) );
};

var parseVariable = function(srcDesc) {
  var preMatch = /stop|and|or/;
  var matcher = /[a-zA-Z]+(\d+[a-zA-Z]*)*/;

  var currSrc = srcDesc.src.slice(srcDesc.cursorIndex);

  var results = currSrc.match(preMatch);
  if (results && results.index === 0) {
    return Err( "Stop is a keyword and cannot be used as a variable" );
  }

  results = currSrc.match(matcher);
  if (!results || results.index !== 0) {
    return Err(
      "could not parse variable starting at index " + (srcDesc.cursorIndex+1)
    );
  }

  srcDesc.cursorIndex += results[0].length;
  return Ok( Ast.createVariable(results[0]) );
};










