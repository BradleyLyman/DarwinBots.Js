/**
 * Exports methods for constructing all AST node types.
 * @module Parser/Ast
 **/

let bodyExpression  = require('./ast/bodyExpression.js'),
    condExpressions = require('./ast/condExpressions.js'),
    dna             = require('./ast/dna.js'),
    gene            = require('./ast/gene.js'),
    phrases         = require('./ast/phrases.js'),
    expressions     = require('./ast/expressions.js');

module.exports = {
  createBodyExpression : bodyExpression.createBodyExpression,

  createECondExpr  : condExpressions.createECondExpr,
  createLCondExpr  : condExpressions.createLCondExpr,
  createGCondExpr  : condExpressions.createGCondExpr,
  createGECondExpr : condExpressions.createGECondExpr,
  createLECondExpr : condExpressions.createLECondExpr,
  createNECondExpr : condExpressions.createNECondExpr,

  createDna : dna.createDna,

  createGene : gene.createGene,

  createAndPhrase : phrases.createAndPhrase,
  createOrPhrase  : phrases.createOrPhrase,

  createLiteral    : expressions.createLiteral,
  createVariable   : expressions.createVariable,
  createMulExpr    : expressions.createMulExpr,
  createDivExpr    : expressions.createDivExpr,
  createAddExpr    : expressions.createAddExpr,
  createSubExpr    : expressions.createSubExpr,
  createPowExpr    : expressions.createPowExpr,
  createUMinusExpr : expressions.createUMinusExpr,
};
