let should    = require('should'),
    dna       = require('../../../src/parser/ast/dna.js'),
    gene      = require('../../../src/parser/ast/gene.js'),
    exprs     = require('../../../src/parser/ast/expressions.js'),
    bodyExpr  = require('../../../src/parser/ast/bodyExpression.js');

let var1 = exprs.createVariable('var1'),
    var2 = exprs.createVariable('var2');

let expr1 = exprs.createLiteral(10),
    expr2 = exprs.createLiteral(20);

let stmt1 = bodyExpr.createBodyExpression(var1, expr1),
    stmt2 = bodyExpr.createBodyExpression(var2, expr2);

let gene1 = gene.createGene([], [stmt1]),
    gene2 = gene.createGene([], [stmt2]);

describe('A DNA AST node', function() {
  let dnaNode = dna.createDna([gene1, gene2]),
      sysvars = {};

  it('should execute each gene', function() {
    dnaNode.execute(sysvars);

    sysvars.should.have.property(var1.name);
    sysvars.should.have.property(var2.name);
    sysvars[var1.name].should.equal(expr1.value);
    sysvars[var2.name].should.equal(expr2.value);
  });
});
