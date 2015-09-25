var fs = require('fs');
var parser = require('./src/parser.js');

fs.readFile('./demo.dbs', 'utf8', function(err, source) {
  if (err) {
    throw err;
  }

  console.log(parser(source));
});
