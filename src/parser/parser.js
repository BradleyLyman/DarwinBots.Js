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
 * Parses the given string into a complete abstract syntax tree representing
 * the source code.
 * @param {SourceManager} srcMgr - Source manager containing the string to parse.
 * @return {Result} Ok value is Ast node representing the Dna,
 *                  Err value is a string describing the error.
 **/
module.exports.parseDna = function(srcMgr) {
  let genes = [];
  let endResult = srcMgr.expectNot('end');

  while (endResult.is_ok()) {
    let gene = parseGene(srcMgr);

    if (gene.is_err()) {
      return gene;
    }
    genes.push(gene.get_ok());

    endResult = srcMgr.expectNot('end');
  }

  return srcMgr
    .expect('end')
    .map(() => Ast.createDna(genes));
};

let parseGene = function(srcMgr) {
  return srcMgr
    .expect('cond')
    .and_then(function() {

      let conds = [];
      let startResult = srcMgr.expectNot('start');

      while (startResult.is_ok()) {
        let cond = parseCondExpression(srcMgr);

        if (cond.is_err()) {
          return cond;
        }

        conds.push(cond.get_ok());

        startResult = srcMgr.expectNot('start');
      }

      return srcMgr.expect('start').map(() => conds);
    })
    .and_then(function(conds) {
      // parse the body expressions
      let bodyExprs = [];
      let stopResult = srcMgr.expectNot('stop');

      while (stopResult.is_ok()) {
        let bodyExpr = parseBodyExpression(srcMgr);

        if (bodyExpr.is_err()) {
          return bodyExpr;
        }

        bodyExprs.push(bodyExpr.get_ok());

        stopResult = srcMgr.expectNot('stop');
      }

      return srcMgr.expect('stop').map(() =>
        Ast.createGene(conds, bodyExprs)
      );
    });
};

let parseCondExpression = function(srcMgr) {
  return parseAndPhrase(srcMgr);
};

let parseAndPhrase = function(srcMgr) {
  return parseOrPhrase(srcMgr)
    .and_then((orPhrase) => srcMgr
      .expect('and')
      .match({
        ok : () => parseAndPhrase(srcMgr).map((andPhrase) =>
          Ast.createAndPhrase(orPhrase, andPhrase)
        ),

        err : () => ok(orPhrase)
      })
    );
};

let parseOrPhrase = function(srcMgr) {
  return parseBoolGroup(srcMgr)
    .and_then((boolGroup) => srcMgr
      .expect('or')
      .match({
        ok : () => parseOrPhrase(srcMgr).map((phrase) =>
          Ast.createOrPhrase(boolGroup, phrase)
        ),
        err : () => ok(boolGroup)
      })
    );
};

let parseBoolGroup = function(srcMgr) {
  return srcMgr
    .expect(/\(/, '(')
    .match({
      ok : () => parseAndPhrase(srcMgr)
        .and_then((andPhrase) => srcMgr
          .expect(/\)/, ')')           // check for the closing paren
          .map(() => andPhrase)
        ),

      err : () => parseBoolTerm(srcMgr)
    });
};

let parseBoolTerm = function(srcMgr) {
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
        return parseExpression(srcMgr)
          .and_then((expr) => srcMgr
            .expect(/\)/)             // check for closing paren
            .map(() => expr)
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
module.exports.parseBoolTerm = parseBoolTerm;

/**
 * Parses the next part of the source as a boolGroup.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
module.exports.parseBoolGroup = parseBoolGroup;

/**
 * Parses the next part of the source as an Or-Phrase.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
module.exports.parseOrPhrase = parseOrPhrase;

/**
 * Parses the next part of the source as an And-Phrase.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
module.exports.parseAndPhrase = parseAndPhrase;

/**
 * Parses the next part of the source as a conditional expression.
 * @param {SourceManager} srcMgr
 * @return {Result} Ok value is Ast node, Err value is an error string.
 **/
module.exports.parseCondExpression = parseCondExpression;

/**
 * Parses the remaining source code section as a gene.
 * @param {Parser/SourceManager~SourceManager} srcMgr
 * @return {Result} Ok value is Ast node representing the gene,
 *                  Err value is a string describing the error.
 **/
module.exports.parseGene = parseGene;
