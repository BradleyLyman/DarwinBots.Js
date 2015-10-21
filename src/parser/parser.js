'use strict';
/**
 * Transforms given source code into the AST representation for
 * consumption by the compiler.
 * @module Parser/Parser
 **/

let Ast           = require('./ast.js'),
    sourceManager = require('./sourceManager.js'),
    Result        = require('object-result'),
    ok            = Result.createOk,
    err           = Result.createErr;

/**
 * Parses the given string into a token representing the number.
 * @param {String} source - String to parse.
 * @return {Result} Ok value is Ast node representing the Dna,
 *                  Err value is a string describing the error.
 **/
module.exports = function(source) {
  let srcMgr = sourceManager(source);

  let genes = [];
  let geneResult = parseGene(srcMgr);
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
let parseGene = function(srcMgr) {
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
      let bodyExprs = [];
      let bodyExpression = parseBodyExpression(srcMgr);
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
let parseCondExpression = function(srcMgr) {
  return parseAndPhrase(srcMgr);
};

/**
 * Parses the next part of the source as an And-Phrase.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
let parseAndPhrase = function(srcMgr) {
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
let parseOrPhrase = function(srcMgr) {
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
let parseBoolGroup = function(srcMgr) {
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

let parseBoolExpression = function(srcMgr) {
  return parseExpression(srcMgr)
    .and_then(function(expression1) {
      let boolOp = srcMgr.expect(/(=)|(!=)|([\><]\=?)/, 'boolean operation');
      if (boolOp.is_err()) {
        return boolOp;
      }

      return parseExpression(srcMgr).map((expression2) => {
        switch (boolOp.get_ok()) {
          case '=':
            return Ast.createECondExpr(expression1, expression2);

          case '<':
            return Ast.createLCondExpr(expression1, expression2);

          case '>':
            return Ast.createGCondExpr(expression1, expression2);

          case '>=':
            return Ast.createGECondExpr(expression1, expression2);

          case '<=':
            return Ast.createLECondExpr(expression1, expression2);

          case '!=':
            return Ast.createNECondExpr(expression1, expression2);
        }
      });
  });
};

let parseBodyExpression = function(srcMgr) {
  return parseVariable(srcMgr)
    .and_then((variable) => srcMgr
      .expect('<-')
      .map(() => variable)
    )
    .and_then((variable) =>
      parseExpression(srcMgr).map((expr) =>
        Ast.createBodyExpression(variable, expr)
      )
    );
};

let parseExpression = function(srcMgr) {
  let addOpMacher = /\+|\-/;
  let expr = parseTerm(srcMgr);
  let term = ok();
  let op   = srcMgr.expect(addOpMacher, 'addition op');

  while (op.is_ok()) {
    term = parseTerm(srcMgr);
    if (term.is_err()) {
      return term;
    }

    switch (op.get_ok()) {
      case '+':
        expr = ok(
          Ast.createAddExpr(expr.get_ok(), term.get_ok())
        );
        break;

      case '-':
        expr = ok(
          Ast.createSubExpr(expr.get_ok(), term.get_ok())
        );
        break;
    }

    op = srcMgr.expect(addOpMacher, 'addition op');
  }

  return expr;
};

let parseTerm = function(srcMgr) {
  let mulOpMatcher = /\*|\//;
  let term = parseFactor(srcMgr);
  let op = srcMgr.expect(mulOpMatcher);
  let factor = ok('');

  while (op.is_ok()) {
    factor = parseFactor(srcMgr);
    if (factor.is_err()) {
      return factor;
    }

    switch (op.get_ok()) {
      case '*':
        term = ok(
          Ast.createMulExpr(term.get_ok(), factor.get_ok())
        );
        break;
      case '/':
        term = ok(
          Ast.createDivExpr(term.get_ok(), factor.get_ok())
        );
        break;
    }

    op = srcMgr.expect(mulOpMatcher);
  }

  return term;
};

let parseFactor = function(srcMgr) {
  return parseUnary(srcMgr)
    .and_then((unary) => srcMgr
      .expect(/\^/, '^')
      .match({
        ok : () =>
          parseFactor(srcMgr).map((factor) =>
            Ast.createPowExpr(unary, factor)
          ),

        err : () => ok(unary),
      })
    );
};

let parseUnary = function(srcMgr) {
  return srcMgr
    .expect('-')
    .match({
      ok : () => {
        return parseUnary(srcMgr).map((unary) =>
          Ast.createUMinusExpr(unary)
        );
      },

      err : () => parseGroup(srcMgr),
    });
};

let parseGroup = function(srcMgr) {
  return srcMgr
    .expect(/\(/, '(')
    .match({
      ok  : () => {
        srcMgr.parenCtr += 1;
        return parseExpression(srcMgr)
          .and_then((expr) => srcMgr   // check for the closing paren
            .expect(/\)/)
            .map(() => {
              srcMgr.parenCtr -= 1;
              return expr;
            })
          );
      },

      err : () =>
        parseLiteral(srcMgr).or_else(() =>
          parseVariable(srcMgr)
        ),
    });
};

let parseLiteral = function(srcMgr) {
  let matcher = /(((\d+)(\.\d*)?)|(\.\d*))(?![a-zA-Z])/;

  return srcMgr
    .expect(matcher, 'number')
    .and_then((value) => {
      if (isNaN(+value)) {
        return err( srcMgr.errAtCursor("Expected valid number") );
      }
    })
    .map((value) =>
      Ast.createLiteral(+value)
    );
};

let parseVariable = function(srcMgr) {
  let keywordMatch = /stop|and|or|start|cond|end/;
  let matcher = /[a-zA-Z]+(\d+[a-zA-Z]*)*/;

  return srcMgr
    .expectNot(keywordMatch, 'keyword')
    .and_then(() => srcMgr
      .expect(matcher, 'variable')
    )
    .map((varName) =>
      Ast.createVariable(varName)
    );
};

// ------------------ PUBLIC EXPORTS --------------------------------- //

/**
 * Parses the next part of the source as a Number.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
module.exports.parseLiteral = parseLiteral;

/**
 * Parses the next part of the source as a Variable.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
module.exports.parseVariable = parseVariable;

/**
 * Parses the next part of the source as a Group.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
module.exports.parseGroup = parseGroup;

/**
 * Parses th enext part of the source as a Unary.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
module.exports.parseUnary = parseUnary;

/**
 * Parses the next part of the source as a Factor.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
module.exports.parseFactor = parseFactor;

/**
 * Parses the next part of the source as a Term.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
module.exports.parseTerm = parseTerm;

/**
 * Parses the next part of the source as an Expression.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
module.exports.parseExpression = parseExpression;

/**
 * Parses the next part of the source as a BodyExpression.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
module.exports.parseBodyExpression = parseBodyExpression;

/**
 * Parses the next part of the source as a BoolExpression.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
module.exports.parseBoolExpression = parseBoolExpression;
