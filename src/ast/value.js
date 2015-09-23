/**
 * @module Value
 * This module contains functions to create value nodes in the form
 * of a literal or a variable.
 **/

/**
 * List of possible type names for value nodes.
 **/
module.exports.ValueTypes = { literal : 'literal', variable : 'var' };

var ValueTypes = module.exports.ValueTypes;

/**
 * Creates a literal value node.
 * @param {Number} value - The literal's value.
 * @return { type, value }
 **/
module.exports.createLiteral = function(value) {
  return {
    type  : ValueTypes.literal,
    value : value
  };
};

/**
 * Creates a  variable value node.
 * @param {String} varName - The variable's name.
 * @return { type, value }
 **/
module.exports.createVar = function(varName) {
  return {
    type  : ValueTypes.variable,
    value : varName
  };
};

