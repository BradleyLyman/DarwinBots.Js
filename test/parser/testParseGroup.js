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
    let valid    = 'abcd)',
        invalid  = '23a',
        keywords = ['cond', 'and', 'or', 'start', 'stop', 'end'];

    it('should parse valid variable names', function() {
      let srcMgr = manager(valid),
          result = parser.parseVariable(srcMgr);

      result.is_ok().should.be.ok();
      result.get_ok().should.have.property('type');
      result.get_ok().type().should.equal(astTypes.VARIABLE);
      result.get_ok().should.have.property('name');
      result.get_ok().name.should.equal('abcd');
    });

    it('should not parse invalid variable names', function() {
      let srcMgr = manager(invalid),
          result = parser.parseVariable(srcMgr);

      result.is_ok().should.not.be.ok();
      result.get_err().should.be.an.instanceOf(String);
    });

    describe('should not accept keywords as variables', function() {
      keywords.forEach(function(word) {
        it(word, function() {
          let srcMgr = manager(word),
              result = parser.parseVariable(srcMgr);

          result.is_ok().should.not.be.ok();
          result.get_err().should.be.an.instanceOf(String);
        });
      });
    });
  });

  describe('should detect either a variable or a literal', function() {
    let variable = manager('abcd'),
        literal  = manager('1234'),
        parens   = manager('(abcd)');

    it('parsing a variable with prarseGroup', function() {
      let result = parser.parseGroup(variable);

      result.is_ok().should.be.ok();

      let varNode = result.get_ok();
      varNode.should.have.property('type');
      varNode.type().should.equal(astTypes.VARIABLE);
      varNode.should.have.property('name');
      varNode.name.should.equal(variable.src);
    });

    it('parsing a literal with parseGroup', function() {
      let result = parser.parseGroup(literal);

      result.is_ok().should.be.ok();

      let litNode = result.get_ok();
      litNode.should.have.property('type');
      litNode.type().should.equal(astTypes.LITERAL);
      litNode.should.have.property('value');
      litNode.value.should.equal(+literal.src);
    });

    it('parsing should respect parens', function() {
      let result = parser.parseGroup(parens);

      result.is_ok().should.be.ok();

      let parenNode = result.get_ok();
      parenNode.should.have.property('type');
      parenNode.type().should.equal(astTypes.VARIABLE);
      parenNode.should.have.property('name');
      parenNode.name.should.equal('abcd');
    });
  });
});
