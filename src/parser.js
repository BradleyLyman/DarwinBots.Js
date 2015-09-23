var Result = require('object-result'),
    Ok     = Result.Ok,
    Err    = Result.Err;

var createNumber = function(val) {
  return {
    type     : 'Number',
    value    : val,
    toString : function() { return "Number(" + val + ")"; }
  };
};

/**
 * Parses the given string into a token representing the number.
 * @param {String} source - String to parse.
 * @return Result -- Ok payload is just the number.
 **/
module.exports = function(source) {
  var cleanSource = source.split(/\s+/)
    .filter(function(tkn) { return tkn !== ''; })
    .join(' ');

  var srcDesc = { cursorIndex : 0, src : cleanSource };

  var numbers = [];
  while (srcDesc.cursorIndex < srcDesc.src.length) {
    var res = parseNumber(srcDesc);
    if (!res.is_err()) {
      numbers.push(res.get_ok().toString());
    } else {
      srcDesc.cursorIndex++;
    }
  }

  return numbers;
};


var parseNumber = function(srcDesc) {
  var matcher = /((\d+)(\.\d*)?)|(\.\d*)/;

  var currSrc = srcDesc.src.slice(srcDesc.cursorIndex);
  var results = currSrc.match(matcher);
  if (!results || results.index !== 0) {
    return Err( "Could not parse token as number" );
  }

  var value = +results[0];
  if (isNaN(value)) {
    return Err( "Could not parse token as number" );
  }

  srcDesc.cursorIndex += results[0].length;
  return Ok( createNumber(value) );
};












