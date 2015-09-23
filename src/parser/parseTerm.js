var valueParser = require('./parseValue.js'),
    AstValue    = require('../ast/value.js'),
    AstTerm     = require('../ast/term.js'),

    Result      = require('object-result'),
    Ok          = Result.Ok;

/**
 * Parses the raw token as a Term, returning a Term object.
 * @param {String} rawToken - The raw token string representing the token.
 * @return Result -- Ok value is Term object.
 **/
module.exports.parseTerm = function(rawToken) {
  var isNegative = rawToken[0] === '-';

  return valueParser.parseValue(rawToken.slice(1)).and_then(function(value) {
    return Ok( AstTerm.createTerm(isNegative, value) );
  });
};
