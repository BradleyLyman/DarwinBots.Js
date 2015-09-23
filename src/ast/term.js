/**
 * Creates a Term node.
 * @param {Bool} isNeg - Is the nerm negated?
 * @param {Value} value - Value node.
 **/
module.exports.createTerm = function(isNeg, value) {
  return {
    isNegative : isNeg === true,
    value      : value
  };
};
