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

  var expr = parseBodyExpression(srcDesc);

  if (expr.is_err()) {
    return expr.get_err();
  }

  return expr.get_ok().toString();
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
        return Ok( Ast.createBodyExpression(variable, expression) );
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

  var newIdx = srcDesc.cursorIndex + results[0].length;
  var next = srcDesc.src[newIdx];
  if (next && !next.toString().match(/[\+\-\*\/\^\)]/)) {
    return Err( "Error parsing number at index " + newIdx );
  }

  srcDesc.cursorIndex = newIdx;
  return Ok( Ast.createNumber(value) );
};

var parseVariable = function(srcDesc) {
  var matcher = /[a-zA-Z]+(\d+[a-zA-Z]*)*/;

  var currSrc = srcDesc.src.slice(srcDesc.cursorIndex);
  var results = currSrc.match(matcher);
  if (!results || results.index !== 0) {
    return Err(
      "could not parse variable starting at index " + (srcDesc.cursorIndex+1)
    );
  }

  srcDesc.cursorIndex += results[0].length;
  return Ok( Ast.createVariable(results[0]) );
};










