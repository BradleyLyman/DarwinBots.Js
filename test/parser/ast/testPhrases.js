let should    = require('should'),
    condExprs = require('../../../src/parser/ast/condExpressions.js'),
    exprs     = require('../../../src/parser/ast/expressions.js'),
    phrases   = require('../../../src/parser/ast/phrases.js');

let num1 = exprs.createLiteral(10),
    num2 = exprs.createLiteral(20);

let trueCond  = condExprs.createNECondExpr(num1, num2),
    falseCond = condExprs.createECondExpr(num1, num2);

let andTable = [
  [ 0, 0, 0 ],
  [ 1, 0, 0 ],
  [ 0, 1, 0 ],
  [ 1, 1, 1 ],
];

let orTable = [
  [ 0, 0, 0 ],
  [ 1, 0, 1 ],
  [ 0, 1, 1 ],
  [ 1, 1, 1 ],
];

describe('An AndPhrase AST node', function() {
  let andPhrase = phrases.createAndPhrase(trueCond, falseCond);

  it('should have lhs and rhs properties', function() {
    andPhrase.should.have.property('lhs');
    andPhrase.should.have.property('rhs');
  });

  andTable.forEach(function(desc) {
    let lhs = (desc[0] === 1 ? trueCond : falseCond);
    let rhs = (desc[1] === 1 ? trueCond : falseCond);
    let expected = (desc[2] === 1);
    let descString = 'should execute ' +
      desc[0] + ' & ' + desc[1] + ' to equal ' + expected;

    it(descString, function() {
      let phrase = phrases.createAndPhrase(lhs, rhs);

      phrase.execute().should.equal(expected);
    });
  });
});

describe('An OrPhrase AST node', function() {
  let orPhrase = phrases.createOrPhrase(trueCond, falseCond);

  it('should have lhs and rhs properties', function() {
    orPhrase.should.have.property('lhs');
    orPhrase.should.have.property('rhs');
  });

  orTable.forEach(function(desc) {
    let lhs = (desc[0] === 1 ? trueCond : falseCond);
    let rhs = (desc[1] === 1 ? trueCond : falseCond);
    let expected = (desc[2] === 1);
    let descString = 'should execute ' +
      desc[0] + ' | ' + desc[1] + ' to equal ' + expected;

    it(descString, function() {
      let phrase = phrases.createOrPhrase(lhs, rhs);

      phrase.execute().should.equal(expected);
    });
  });
});
