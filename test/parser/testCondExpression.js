'use strict';
let should   = require('should'),
    parser   = require('../../src/parser/parser.js'),
    manager  = require('../../src/parser/sourceManager.js'),
    astTypes = require('../../src/parser/ast/typenames.js');

let andPhrase = '2 < 3 and 1 > 1',
    orPhrase  = '2 = 1 or 1 = 3';

let t = '2 < 3',
    f = '2 > 3';

let descriptors = [
  [ `${f} and ${f} or ${t}`, false ],
  [ `(${f} and ${f}) or ${t}`, true],
];

describe('The parser', function() {
  describe('should handle order of operations for bool expressions:', () => {
    descriptors.forEach((desc) => {
      it(desc[0], () => {
        let result = parser.parseCondExpression(manager(desc[0]));

        result.is_ok().should.be.ok();

        let node = result.get_ok();
        node.execute().should.equal(desc[1]);
      });
    });
  });

  it('should parse a valid and-phrase', function() {
    let result = parser.parseCondExpression(manager(andPhrase));

    result.is_ok().should.be.ok();

    let node = result.get_ok();
    node.should.have.property('type');
    node.type().should.equal(astTypes.AND_PHRASE);
  });

  it('should parse a valid or-phrase', function() {
    let result = parser.parseCondExpression(manager(orPhrase));

    result.is_ok().should.be.ok();

    let node = result.get_ok();
    node.should.have.property('type');
    node.type().should.equal(astTypes.OR_PHRASE);
  });
});
