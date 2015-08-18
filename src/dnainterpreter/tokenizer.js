/**
 * This module performs the first-pass of the compilation process --
 * transforming a raw string of DarwinBot's dna source into an array
 * of Tokens.
 * @module tokenizer
 **/

var Immutable = require('immutable');

/**
 * @typedef Line_Descriptor
 * @type {Object}
 * @property {Number} lineNum
 * @property {Array.<String>} token_values
 **/

/**
 * @typedef Token
 * @type {Object}
 * @property {Number} lineNum - line number that the token was originally on
 * @property {String} value   - token's value as a plain string
 **/

/**
 * Contains module's private methods, exported for testing.
 **/
module.exports._private = {};

var _splitOnLines =
/**
 * Takes raw source code as a string and returns
 * the code split up as lines with corresponding line
 * numbers.
 * @param {String} source - Source code for the bot's dna.
 * @return {Array.<module:tokenizer~Line_Descriptor>}
 **/
module.exports._private.splitOnLines = function(source) {
  var rawSplit = source.split("\n");

  return rawSplit
    .map(function(line, i) {
      return {
        lineNum      : i+1,
        token_values : line.match(/\S+/g)
      };
    })
    .filter(function(rowObj) {
      return rowObj.token_values !== null;
    });
};

var _linesToTokenStack =
/**
 * Takes the Array of {@link Line_Descriptor} output by splitOnLines
 * and transforms it into a list of token objects.
 * @param {Array.<Line_Descriptor>} lineTokens - Array of tokens on each line.
 * @return {Array.<Token>} Single array of tokens.
 **/
module.exports._private.linesToTokenStack = function(lineTokens) {
  var tokens = [];

  tokens.unshift({
    lineNum : lineTokens[0].lineNum,
    value   : ""
  });

  lineTokens.forEach(function(lineToken) {
    lineToken.token_values.forEach(function(value) {
      tokens.unshift({
        lineNum : lineToken.lineNum,
        value   : value
      });
    });
  });

  return Immutable.Stack().unshiftAll(tokens);
};

/**
 * Transforms raw source code into a list of easily parsable tokens.
 * @param {String} source - DarwinBots Dna source
 * @return {module:tokenizer~Token[]} Token stack.
 **/
module.exports.tokenize = function(source) {
  return _linesToTokenStack(_splitOnLines(source));
};

