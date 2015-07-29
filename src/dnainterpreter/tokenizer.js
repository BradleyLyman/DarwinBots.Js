var Immutable = require('immutable');

/**
 * Takes raw source code as a string and returns
 * the code split up as lines with corresponding line
 * numbers.
 * Returns;
 *   List of objects of the form { lineNum: n, tokens: [] }
 **/
var _splitOnLines = function(sourceAsString) {
  var rawSplit = sourceAsString.split("\n");

  return rawSplit
    .map(function(line, i) {
      return {
        lineNum : i+1,
        tokens  : line.match(/\S+/g)
      };
    })
    .filter(function(rowObj) {
      return rowObj.tokens !== null;
    });
};

/**
 * Takes the list of line objects output by _splitOnLines
 * and transforms it into a list of token objects.
 * Returns:
 *   List of objects of the form { lineNum: n, token: [] }.
 **/
var _linesToTokenStack = function(lineTokens) {
  var tokens = [];

  lineTokens.forEach(function(lineToken) {
    lineToken.tokens.forEach(function(token) {
      tokens.unshift({
        lineNum : lineToken.lineNum,
        value   : token
      });
    });
  });

  return Immutable.Stack().unshiftAll(tokens);
};

/**
 * Internal module functions, exported for testing.
 **/
module.exports._private = {
  splitOnLines      : _splitOnLines,
  linesToTokenStack : _linesToTokenStack
};

/**
 * The tokenize function which takes the source code and returns
 * a Stack of tokens where the top of the stack is the bottom of
 * the file.
 **/
module.exports.tokenize = function(source) {
  return _linesToTokenStack(_splitOnLines(source));
};









