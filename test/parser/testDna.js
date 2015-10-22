let should = require('should'),
    parser = require('../../src/parser/parser.js'),
    manager = require('../../src/parser/sourceManager.js'),
    astTypes = require('../../src/parser/ast/typenames.js');

let normalDna = 'cond 1 = 1 start p <- 5 stop cond p = 6 start q <- 5 stop cond q = 5 start p <- 6 stop end';
let noEnd = 'cond 1 = 1 start p <- 5 stop';

describe('The parser', () => {
  it('should correctly parse normal dna', () => {
    let result = parser.parseDna(manager(normalDna)),
        sysvars = {};

    result.is_ok().should.be.ok();

    let node = result.get_ok();
    node.should.have.property('type');
    node.type().should.equal(astTypes.DNA);
    node.should.have.property('genes');
    node.genes.length.should.equal(3);

    node.execute(sysvars);

    sysvars.should.have.property('p');
    sysvars.p.should.equal(5);
  });

  it('should show an error for dna with no end', () => {
    let result = parser.parseDna(manager(noEnd));

    result.is_err().should.be.ok();
  });
});
