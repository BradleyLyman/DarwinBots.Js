/**
 * Provides methods for compiling and manipulating DarwinBots dna
 * source code.
 * @module Parser
 **/

var parse   = require('./parser.js'),
    compile = require('./compiler.js'),
    Result  = require('object-result'),
    Ok      = Result.Ok,
    Err     = Result.Err;

/**
 * Compiles the given DNA source code into an executable javascript function.
 * @param {String} sourceAsString - The DNA source code.
 * @return {Result} Ok value is the function that executes the dna, Err value
 *                  is an error message describing why compilation failed.
 **/
module.exports.compileSource = function(sourceAsString) {
  return parse(sourceAsString)
    .and_then(function(sourceAsAST) {
      return Ok( compile(sourceAsAST) );
    });
};
