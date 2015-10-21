let should   = require('should'),
    parser   = require('../../src/parser/parser.js'),
    astTypes = require('../../src/parser/ast/typenames.js'),
    manager  = require('../../src/parser/sourceManager.js');

let invalid = '3';

let descriptors = [
  [ '2 = 1', 'equal', astTypes.E_COND_EXPR ],
  [ '2 > 1', 'greater', astTypes.G_COND_EXPR ],
  [ '2 < 1', 'less', astTypes.L_COND_EXPR ],
  [ '2 <= 1', 'less than or equal', astTypes.LE_COND_EXPR ],
  [ '3 >= 2', 'greater than or equal', astTypes.GE_COND_EXPR ],
  [ '1 != 2', 'not equal', astTypes.NE_COND_EXPR ],
];

describe('The parser', () => {
  it('should not parse an invalid bool expression', () => {
    let mgr    = manager(invalid),
        result = parser.parseBoolExpression(mgr);

    result.is_err().should.be.ok();
    result.get_err().should.be.an.instanceOf(String);
  });

  descriptors.forEach((desc) => {
    it('should correctly parse '+desc[0]+' as a '+desc[1]+' expr', () => {
      let mgr    = manager(desc[0]),
          result = parser.parseBoolExpression(mgr);

      result.is_ok().should.be.ok();

      let cond = result.get_ok();
      cond.should.have.property('type');
      cond.type().should.equal(desc[2]);
    });
  });
});
