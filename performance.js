var fs        = require('fs'),
    tokenizer = require('./src/dnainterpreter/tokenizer.js'),
    parser    = require('./src/dnainterpreter/parser.js');

var dnaSource = fs.readFileSync("./exampleDna.db", { encoding : 'utf8' });

var dnaResult = parser.parseDna(tokenizer.tokenize(dnaSource));

if (dnaResult.error === null) {
  var dnaFunc = dnaResult.result;

  var start = process.hrtime();
  for (var i = 0; i < 10000; i++) {
    dnaFunc({});
  }
  var duration = process.hrtime(start);

  console.log("duration: " + duration[0] + " seconds and " + duration[1]/1000000 + " milliseconds");
}
else
{
  console.log("Error parsing dna");
  console.log(dnaResult.error.message);
}




