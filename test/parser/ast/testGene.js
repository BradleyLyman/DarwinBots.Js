let should    = require('should'),
    gene      = require('../../../src/parser/ast/gene.js'),
    condExprs = require('../../../src/parser/ast/condExpressions.js'),
    bodyExpr  = require('../../../src/parser/ast/bodyExpression.js'),
    exprs     = require('../../../src/parser/ast/expressions.js');

let num1 = exprs.createLiteral(10),
    num2 = exprs.createLiteral(12);

let trueCond  = condExprs.createLCondExpr(num1, num2),
    falseCond = condExprs.createECondExpr(num1, num2);

let var1 = exprs.createVariable('somevar');

let stmt1 = bodyExpr.createBodyExpression(var1, num1),
    stmt2 = bodyExpr.createBodyExpression(var1, num2);

describe('A Gene AST node', function() {
  it('should execute when the cond evaluates to true', function() {
    let geneNode = gene.createGene(trueCond, [stmt1, stmt2]),
        sysvars  = {};

    geneNode.execute(sysvars);

    sysvars.should.have.property(var1.name);
    sysvars[var1.name].should.equal(num2.value);
  });

  it('should not execute when the cond evaluates to false', function() {
    let geneNode = gene.createGene(falseCond, [stmt1, stmt2]),
        sysvars  = { somevar : 3300 };

    geneNode.execute(sysvars);

    sysvars.should.have.property(var1.name);
    sysvars[var1.name].should.equal(3300);
  });
});
