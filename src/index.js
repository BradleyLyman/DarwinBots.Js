var parser = require('./parser/index.js'),
    Simulation = require('./simulation/Simulation.js'),
    Species    = require('./simulation/Species.js');

module.exports.compileSource = parser.compileSource;
module.exports.Simulation    = Simulation;
module.exports.Species       = Species;

