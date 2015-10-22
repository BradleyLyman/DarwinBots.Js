let should   = require('should'),
    parser   = require('../../src/parser/parser.js'),
    manager  = require('../../src/parser/sourceManager.js'),
    astTypes = require('../../src/parser/ast/typenames.js');

describe('The parser', () => {
  let validExpression = 'abcd <- 4 * 100',
      invalidExpression = '5 * 1 -> acd';

  it('should parse a valid expression', () => {
    let mgr     = manager(validExpression),
        result  = parser.parseBodyExpression(mgr),
        sysvars = {};

    result.is_ok().should.be.ok();

    let expr = result.get_ok();
    expr.should.have.property('type');
    expr.type().should.equal(astTypes.BODY_EXPR);

    expr.execute(sysvars);
    sysvars.should.have.property('abcd');
    sysvars.abcd.should.equal(4*100);
  });

  it('should not parse an invalid expression', () => {
    let mgr = manager(invalidExpression),
        result = parser.parseBodyExpression(mgr);

    result.is_err().should.be.ok();
    result.get_err().should.be.an.instanceOf(String);
  });
});
