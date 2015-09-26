var fs = require('fs');
var parse = require('./src/parser/index.js');

fs.readFile('./demo.dbs', 'utf8', function(err, source) {
  if (err) {
    throw err;
  }

  parse(source)
    .and_then(function(dna) {
      console.log(dna.toString());
    })
    .or_else(function(err) {
      console.log(err);
    });
});
