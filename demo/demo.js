var fs = require('fs');
var darwinBots = require('../src/index.js');


fs.readFile('./demo/demo.dbs', 'utf8', function(err, source) {
  if (err) {
    throw err;
  }

  darwinBots.compileSource(source)
    .and_then(function(compiledSource) {
      var sysvars = {};

      var timesToRun = 1000;
      console.log("Executing source " + timesToRun + " times.");
      var start = process.hrtime();
      for (var i = 0; i < timesToRun; i++) {
        compiledSource(sysvars);
      }
      var duration = process.hrtime(start);

      var totalTime = duration[0] * 1000 + duration[1]*1e-6;
      console.log("duration: " + totalTime + " milliseconds");
      console.log("time per dna execution: " + totalTime / timesToRun + " milliseconds");
    })
    .or_else(function(err) {
      console.log(err);
    });
});
