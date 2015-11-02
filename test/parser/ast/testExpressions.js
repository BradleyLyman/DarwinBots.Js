let should      = require('should'),
    expressions = require('../../../src/parser/ast/expressions.js');

describe('A Literal AST node', function() {
  let literal = expressions.createLiteral(100);

  it('should contain a numeric value', function() {
    literal.should.have.property('value');
    literal.value.should.equal(100);
  });

  it('should return the numeric value when executed', function() {
    literal.execute().should.equal(100);
  });
});

describe('A Variable AST node', function() {
  let variable = expressions.createVariable('testval'),
      sysvars  = { testval : 20 };

  it("should contain the variable's name", function() {
    variable.should.have.property('name');
    variable.name.should.equal('testval');
  });

  it("should return the variable's value when executed", function() {
    variable.execute(sysvars).should.equal(20);
  });

  it('should return a random value if named rnd', function() {
    let rndVar  = expressions.createVariable('rnd'),
        sysvars = { rnd : 300 };

    let value = rndVar.execute(sysvars);
    (value < 300).should.be.ok();
  });
});

describe('A UMinus AST node', function() {
  let literal = expressions.createLiteral(10),
      uminus = expressions.createUMinusExpr(literal);

  it("should contain an expression to negate", function() {
    uminus.should.have.property('expression');
    uminus.expression.should.equal(literal);
  });

  it("should return -expression when executed", function() {
    uminus.execute().should.equal(-10);
  });
});

describe('A PowExpr AST node', function() {
  let base     = expressions.createLiteral(1.3),
      exponent = expressions.createLiteral(3.2),
      pow      = expressions.createPowExpr(base, exponent);

  it("should contain expressions for the base and exponent", function() {
    pow.should.have.property('lhs');
    pow.should.have.property('rhs');
  });

  it("should compute Math.pow(base, exponent) when executed", function() {
    pow.execute().should.equal(Math.pow(base.value, exponent.value));
  });
});

describe('An MulExpr AST node', function() {
  let lhs = expressions.createLiteral(2),
      rhs = expressions.createLiteral(4),
      mul = expressions.createMulExpr(lhs, rhs);

  it("should contain lhs and rhs", function() {
    mul.should.have.property('lhs');
    mul.should.have.property('rhs');
  });

  it('should compute the product lhs*rhs when executed', function() {
    mul.execute().should.equal(lhs.value * rhs.value);
  });
});

describe('An DivExpr AST node', function() {
  let lhs = expressions.createLiteral(2),
      rhs = expressions.createLiteral(4),
      div = expressions.createDivExpr(lhs, rhs);

  it("should contain lhs and rhs", function() {
    div.should.have.property('lhs');
    div.should.have.property('rhs');
  });

  it('should compute the ratio lhs/rhs when executed', function() {
    div.execute().should.equal(lhs.value / rhs.value);
  });
});

describe('An AddExpr AST node', function() {
  let lhs = expressions.createLiteral(2),
      rhs = expressions.createLiteral(4),
      add = expressions.createAddExpr(lhs, rhs);

  it("should contain lhs and rhs", function() {
    add.should.have.property('lhs');
    add.should.have.property('rhs');
  });

  it('should compute the sum lhs+rhs when executed', function() {
    add.execute().should.equal(lhs.value + rhs.value);
  });
});

describe('A SubExpr AST node', function() {
  let lhs = expressions.createLiteral(2),
      rhs = expressions.createLiteral(4),
      sub = expressions.createSubExpr(lhs, rhs);

  it("should contain lhs and rhs", function() {
    sub.should.have.property('lhs');
    sub.should.have.property('rhs');
  });

  it('should compute the difference lhs-rhs when executed', function() {
    sub.execute().should.equal(lhs.value - rhs.value);
  });
});


