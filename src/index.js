var parse   = require('./parser/parser.js'),
    compile = require('./parser/compiler.js'),
    Result  = require('object-result'),
    Ok      = Result.Ok,
    Err     = Result.Err;

module.exports.compileSource = function(sourceAsString) {
  return parse(sourceAsString)
    .and_then(function(sourceAsAST) {
      return Ok( compile(sourceAsAST) );
    });
};
