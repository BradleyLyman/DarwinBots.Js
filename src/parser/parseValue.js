var AstValue      = require('../ast/value.js'),
    createLiteral = AstValue.createLiteral,
    createVar     = AstValue.createVar,

    Result = require('object-result'),
    Ok     = Result.Ok,
    Err    = Result.Err;

var variableMatcher = /^[a-zA-Z]/;

/**
 * Parses the raw token for either a numeric literal or the name
 * of a variable.
 * @param {String} rawToken - The raw token string to be parsed.
 * @return Result -- If Ok then contains a Value node.
 **/
module.exports.parseValue = function(rawToken) {
  var literalVal = +rawToken;

  if (!isNaN(literalVal)) {
    return Ok( createLiteral(literalVal) );
  }

  if (variableMatcher.test(rawToken)) {
    return Ok( createVar(rawToken) );
  }

  return Err("Could not parse '" + rawToken + "' as a value");
};

