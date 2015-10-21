let should   = require('should'),
    parser   = require('../../src/parser/parser.js'),
    manager  = require('../../src/parser/sourceManager.js'),
    astTypes = require('../../src/parser/ast/typenames.js');

let emptyGene = 'cond start stop',
    emptyCondGene = 'cond start p <- 5 stop',
    normalGene = 'cond 3 > 2 2 != 1 start p <- 5 a <- p stop',
    noCond = 'start p <- 5 stop',
    noStart = 'cond 2 < 3 p <- 5 stop',
    noStop  = 'cond 2 < 3 start p <- 5';


describe('The parser', () => {
  it('should error if gene is missing cond keyword', () => {
    let result = parser.parseGene(manager(noCond));

    result.is_err().should.be.ok();
  });

  it('should error if gene is missing start keyword', () => {
    let result = parser.parseGene(manager(noStart));

    result.is_err().should.be.ok();
  });

  it('should error if gene is missing stop keyword', () => {
    let result = parser.parseGene(manager(noStop));

    result.is_err().should.be.ok();
  });

  it('should correctly parse an empty gene', () => {
    let result  = parser.parseGene(manager(emptyGene)),
        sysvars = {};

    result.is_ok().should.be.ok();
    result.get_ok().type().should.equal(astTypes.GENE);
    result.get_ok().execute(sysvars);
  });

  it('should correctly parse a gene with empty cond', () => {
    let result  = parser.parseGene(manager(emptyCondGene)),
        sysvars = {};

    result.is_ok().should.be.ok();
    result.get_ok().type().should.equal(astTypes.GENE);
    result.get_ok().execute(sysvars);

    sysvars.should.have.property('p');
    sysvars.p.should.equal(5);
  });

  it('should correctly parse a normal gene', () => {
    let result  = parser.parseGene(manager(normalGene)),
        sysvars = {};

    result.is_ok().should.be.ok();
    result.get_ok().type().should.equal(astTypes.GENE);
    result.get_ok().execute(sysvars);

    sysvars.should.have.property('p');
    sysvars.should.have.property('a');
    sysvars.p.should.equal(5);
    sysvars.a.should.equal(sysvars.p);
  });
});
