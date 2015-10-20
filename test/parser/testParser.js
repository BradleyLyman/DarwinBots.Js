let should   = require('should'),
    parser   = require('../../src/parser/parser.js'),
    manager   = require('../../src/parser/sourceManager.js'),
    astTypes = require('../../src/parser/ast/typenames.js');

describe('The parser', function() {
  describe('when parsing literal values', function() {
    let valid = '10',
        invalid = 'ab3';

    it('should parse valid numbers', function() {
      let srcMgr = manager(valid);
      let result = parser.parseLiteral(srcMgr);

      result.is_ok().should.be.ok();

      let literal = result.get_ok();
      literal.should.have.property('type');
      literal.type().should.equal(astTypes.LITERAL);

      literal.should.have.property('value');
      literal.value.should.equal(10);
    });

    it('should not parse invalid numbers', function() {
      let srcMgr = manager(invalid);
      let result = parser.parseLiteral(srcMgr);

      result.is_ok().should.not.be.ok();
      result.get_err().should.be.an.instanceOf(String);
    });
  });


  describe('when parsing variable names', function() {
    let valid   = 'abcda',
        invalid = '23a';

    it('should parse valid variable names', function() {
      let srcMgr = manager(valid),
          result = parser.parseVariable(srcMgr);

      result.is_ok().should.be.ok();
      result.get_ok().should.have.property('type');
      result.get_ok().type().should.equal(astTypes.VARIABLE);
      result.get_ok().should.have.property('name');
      result.get_ok().name.should.equal(valid);
    });
  });
});
