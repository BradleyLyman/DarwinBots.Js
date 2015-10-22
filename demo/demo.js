'use strict';
var fs = require('fs');
var DarwinBots = require('../src/index.js');

fs.readFile('./demo/demo.dbs', 'utf8', function(err, source) {
  if (err) {
    throw err;
  }

  var demoSpecies = DarwinBots.Species.createSpecies(source, "demo");
  if (!demoSpecies.isValid) {
    console.log(demoSpecies.compileErr);
  }

  var simConfig = {
    initialNrg    : 100,
    nrgDecayRate  : 2,
    speciesConfig : {
      'demo' : { species : demoSpecies, initialPopulation : 50000 }
    }
  };

  DarwinBots.createSimulation(simConfig)
    .and_then(function(simulation) {
      var start = process.hrtime();
      var steps = 10;

      for (var i = 0; i < steps; i++) {
        DarwinBots.stepSimulation(simulation);
      }
      var duration = process.hrtime(start);

      var totalTime = duration[0] * 1000 + duration[1] * (1e-6);
      console.log(
        "bots in simulation: " + simConfig.speciesConfig.demo.species.initialPopulation
      );
      console.log("simulation steps: " + steps);
      console.log("total simulation time: " + totalTime + " ms");
      console.log("time per simulation step: " + totalTime / steps + " ms");
    })
    .or_else(function(err) {
      console.log(err);
    });
});



