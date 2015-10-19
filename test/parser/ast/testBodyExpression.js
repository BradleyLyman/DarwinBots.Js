let should      = require('should'),
    bodyExpr    = require('../../../src/parser/ast/bodyExpression.js'),
    expressions = require('../../../src/parser/ast/expressions.js');

describe('A BodyExpression AST node', function() {
  let varToAssign  = expressions.createVariable('someval'),
      exprNode     = expressions.createLiteral(100),
      bodyExprNode = bodyExpr.createBodyExpression(varToAssign, exprNode),
      sysvars      = {};

  it('should have a variable node and and expression node', function() {
    bodyExprNode.should.have.property('variable');
    bodyExprNode.should.have.property('expression');
  });

  it('should assign the result of an expression to a variable', function() {
    bodyExprNode.execute(sysvars);

    sysvars.should.have.property(varToAssign.name);
    sysvars[varToAssign.name].should.equal(exprNode.value);
  });
});
