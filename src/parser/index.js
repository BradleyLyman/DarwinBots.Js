/**
 * Provides methods for compiling and manipulating DarwinBots dna
 * source code.
 * @module Parser
 **/

var parse   = require('./parser.js'),
    Result  = require('object-result'),
    ok      = Result.createOk,
    err     = Result.createErr;

/**
 * Compiles the given DNA source code into an executable javascript function.
 * @param {String} sourceAsString - The DNA source code.
 * @return {Result} Ok value is the function that executes the dna, Err value
 *                  is an error message describing why compilation failed.
 **/
module.exports.compileSource = function(sourceAsString) {
  return parse(sourceAsString);
};
