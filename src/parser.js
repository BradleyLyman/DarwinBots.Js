var Result = require('object-result'),
    Ok     = Result.Ok,
    Err    = Result.Err;

var createNumber = function(val) {
  return {
    type     : 'Number',
    value    : val,
    toString : function() { return "Number(" + val + ")"; }
  };
};

var createDivExpr = function(factor1, factor2) {
  return {
    type : 'DivExpr',
    factor1 : factor1,
    factor2 : factor2,
    toString : function() {
      return "DivExpr(" + factor1.toString() + " / " + factor2.toString() + ")";
    }
  };
};

var createMulExpr = function(factor1, factor2) {
  return {
    type : 'MulExpr',
    factor1 : factor1,
    factor2 : factor2,
    toString : function() {
      return "MulExpr(" + factor1.toString() + " * " + factor2.toString() + ")";
    }
  };
};

var createAddExpr = function(term1, term2) {
  return {
    type : 'AddExpr',
    term1 : term1,
    term2 : term2,
    toString : function() {
      return "AddExpr(" + term1.toString() + " + " + term2.toString() + ")";
    }
  };
};

var createSubExpr = function(term1, term2) {
  return {
    type : 'SubExpr',
    term1 : term1,
    term2 : term2,
    toString : function() {
      return "SubExpr(" + term1.toString() + " - " + term2.toString() + ")";
    }
  };
};

var createPowExpr = function(base, exp) {
  return {
    type : 'PowExpr',
    base : base,
    exp  : exp,
    toString : function() {
      return "PowExpr(" + base.toString() + " ^ " + exp.toString() + ")";
    }
  };
};

var createVariable = function(name) {
  return {
    type : 'Variable',
    name : name,
    toString : function() {
      return "Variable(" + name + ")";
    }
  };
};

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

  var expr = parseExpression(srcDesc);

  if (expr.is_err()) {
    return expr.get_err();
  }

  return expr.get_ok().toString();
};


var parseExpression = function(srcDesc) {
  return parseTerm(srcDesc)
    .and_then(function(term1) {
      // if + then this is an add expr
      if (srcDesc.peek() === '+') {
        srcDesc.cursorIndex++;

        return parseExpression(srcDesc).and_then(function(term2) {
          return Ok( createAddExpr(term1, term2) );
        });
      }

      // if - then this is a sub expr
      if (srcDesc.peek() === '-') {
        srcDesc.cursorIndex++;

        return parseExpression(srcDesc).and_then(function(term2) {
          return Ok( createSubExpr(term1, term2) );
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
          return Ok( createMulExpr(factor1, factor2) );
        });
      }

      // if / then this is a division expression
      if (srcDesc.peek() === '/') {
        srcDesc.cursorIndex++;

        return parseTerm(srcDesc).and_then(function(factor2) {
          return Ok( createDivExpr(factor1, factor2) );
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
        return Ok( createPowExpr(unary, factor) );
      });
    }
  });
};

var parseUnary = function(srcDesc) {
  if (srcDesc.peek() === '-') {
    srcDesc.cursorIndex++;

    return parseUnary(srcDesc).and_then(function(unary) {
      return Ok( createUnaryMinus(unary) );
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
  if (next && !next.toString().match(/[\+\-\*\/\^]/)) {
    return Err( "Error parsing number at index " + newIdx );
  }

  srcDesc.cursorIndex = newIdx;
  return Ok( createNumber(value) );
};

var parseVariable = function(srcDesc) {
  var matcher = /(\w+)/;

  var currSrc = srcDesc.src.slice(srcDesc.cursorIndex);
  var results = currSrc.match(matcher);
  if (!results || results.index !== 0) {
    return Err(
      "could not parse variable starting at index " + (srcDesc.cursorIndex+1)
    );
  }

  srcDesc.cursorIndex += results[0].length;
  return Ok( createVariable(results[0]) );
};










