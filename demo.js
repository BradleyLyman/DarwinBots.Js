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

      console.log(sysvars);
    })
    .or_else(function(err) {
      console.log(err);
    });
});
