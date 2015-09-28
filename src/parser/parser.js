/**
 * Transforms given source code into the AST representation for
 * consumption by the compiler.
 * @module Parser/Parser
 **/

var Ast    = require('./ast.js'),
    sourceManager = require('./sourceManager.js'),
    Result = require('object-result'),
    Ok     = Result.Ok,
    Err    = Result.Err;

/**
 * Parses the given string into a token representing the number.
 * @param {String} source - String to parse.
 * @return {Result} Ok value is Ast node representing the Dna,
 *                  Err value is a string describing the error.
 **/
module.exports = function(source) {
  var srcMgr = sourceManager(source);

  var genes = [];
  var geneResult = parseGene(srcMgr);
  while (!geneResult.is_err()) {
    genes.push(geneResult.get_ok());

    geneResult = parseGene(srcMgr);
  }

  if (srcMgr.insideGene !== 0) {
    return geneResult;
  }

  return srcMgr
    .expect('end')
    .and_then(function() {
      return Ok( Ast.createDna(genes) );
    });
};

/**
 * Parses the remaining source code section as a gene.
 * @param {Parser/SourceManager~SourceManager} srcMgr
 * @return {Result} Ok value is Ast node representing the gene,
 *                  Err value is a string describing the error.
 **/
var parseGene = function(srcMgr) {
  return srcMgr
    .expect('cond')
    .and_then(function() {
      srcMgr.insideGene = 1;

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

      srcMgr.insideGene = 0;
      return Ok( Ast.createGene(condExpression, bodyExprs) );
    });
};

/**
 * Parses the next part of the source as a conditional expression.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
var parseCondExpression = function(srcMgr) {
  return parseAndPhrase(srcMgr);
};

/**
 * Parses the next part of the source as an And-Phrase.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
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

/**
 * Parses the next part of the source as an Or-Phrase.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
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

/**
 * Parses the next part of the source as a Gene.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
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

/**
 * Parses the next part of the source as a BoolExpression.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
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

/**
 * Parses the next part of the source as a BodyExpression.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
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

/**
 * Parses the next part of the source as an Expression.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
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

/**
 * Parses the next part of the source as a Term.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
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

/**
 * Parses the next part of the source as a Factor.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
var parseFactor = function(srcMgr) {
  return parseUnary(srcMgr).and_then(function(unary) {
    if (!srcMgr.expect(/\^/, '^').is_err()) {
      return parseFactor(srcMgr).and_then(function(factor) {
        return Ok( Ast.createPowExpr(unary, factor) );
      });
    }
  });
};

/**
 * Parses th enext part of the source as a Unary.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
var parseUnary = function(srcMgr) {
  if (!srcMgr.expect(/\-/, '-').is_err()) {
    return parseUnary(srcMgr).and_then(function(unary) {
      return Ok( Ast.createUnaryMinus(unary) );
    });
  }

  return parseGroup(srcMgr);
};

/**
 * Parses the next part of the source as a Group.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
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

/**
 * Parses the next part of the source as a Number.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
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

/**
 * Parses the next part of the source as a Variable.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
var parseVariable = function(srcMgr) {
  var keywordMatch = /stop|and|or|start|cond|end/;
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










