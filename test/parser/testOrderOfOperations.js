'use strict';
let should  = require('should'),
    parser  = require('../../src/parser/parser.js'),
    manager = require('../../src/parser/sourceManager.js');

let exprDescs = [
  [ '2*2 + 3', 7 ],
  [ '3^2*4 + 1', 37 ] ,
  [ '3^(2*4) + 1', 6562 ],
  [ '2 / -1 / 2', -1 ],
  [ '2^3^2', 512 ],
];

describe('The parser', function() {
  exprDescs.forEach((desc) => {
    it('should use proper order of operations for ' + desc[0], function() {
      let srcMgr = manager(desc[0]),
          result = parser.parseExpression(srcMgr);

      result.is_ok().should.be.ok();

      let exprNode = result.get_ok();
      exprNode.execute().should.equal(desc[1]);
    });
  });
});
