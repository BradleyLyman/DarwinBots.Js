'use strict';
/**
 * Provides methods for compiling and manipulating
 * DarwinBots dna source code.
 * @module Parser
 **/

var parser  = require('./parser.js'),
    manager = require('./sourceManager.js');

/**
 * Compiles the given DNA source code into an executable
 * javascript function.
 * @param {String} sourceAsString - The DNA source code.
 * @return {Result} Ok value is just the DNA ast node
 *                  which provided an execute method for
 *                  running the DNA. Err value is an error
 *                  message describing why compilation
 *                  failed.
 **/
module.exports.compileSource = function(sourceAsString) {
  return parser.parseDna(manager(sourceAsString));
};
