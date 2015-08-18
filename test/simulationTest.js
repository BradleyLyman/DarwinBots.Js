var Simulation = require('../src/simulation.js');

module.exports.testCreateSimFromConfig = {
  noConfig : function(test) {
    var sim = Simulation.createSimFromConfig();
    test.done();
  }
};
