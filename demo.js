var fs = require('fs');
var parse = require('./src/parser/index.js'),
    compiler = require('./src/parser/compiler.js');

var parsedSource, compiledSource;

fs.readFile('./demo.dbs', 'utf8', function(err, source) {
  if (err) {
    throw err;
  }

  parse(source)
    .and_then(function(dna) {
      parsedSource   = dna;
      compiledSource = compiler.compileDna(dna);

      var sysvars = {};
      console.log(sysvars);
      compiledSource(sysvars);

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
