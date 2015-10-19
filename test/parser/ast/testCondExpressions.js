let should          = require('should'),
    condExprs = require('../../../src/parser/ast/condExpressions.js'),
    expressions     = require('../../../src/parser/ast/expressions.js');

let lhs = expressions.createLiteral(20),
    rhs = expressions.createLiteral(10);

let testDescs = [
  { name : '=',  expect : false, ctor : condExprs.createECondExpr },
  { name : '>',  expect : true , ctor : condExprs.createGCondExpr },
  { name : '<',  expect : false, ctor : condExprs.createLCondExpr },
  { name : '!=', expect : true,  ctor : condExprs.createNECondExpr },
  { name : '>=', expect : true,  ctor : condExprs.createGECondExpr },
  { name : '<=', expect : false, ctor : condExprs.createLECondExpr },
];

testDescs.forEach(function(desc) {
  let condExpr = desc.ctor(lhs, rhs);

  describe('A ' + condExpr.type() + ' AST node', function() {
    it('should have an lhs and rhs', function() {
      condExpr.should.have.property('lhs');
      condExpr.should.have.property('rhs');
    });

    it('should evaluate lhs ' + desc.name + ' rhs when executed', function() {
      condExpr.execute().should.equal(desc.expect);
    });
  });
});


