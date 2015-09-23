var stdin = process.stdin;

var parser = require('./src/parser.js');

stdin.addListener('data', function(data) {
  var result = parser(data.toString());

  console.log(result);
});
