/**
 * Exports a factory function for creating an AST node representing an
 * and-phrase.
 * @module Parser/Ast/andPhrase
 **/
let typenames = require('./typenames.js');

/** @class AndPhrase **/
let AndPhrase = {};

AndPhrase.prototype = {
  /** @lends AndPhrase **/

  /**
   * The type of this node -- useful for debugging
   * and pretty printing.
   * @return {String} This node's type name.
   **/
  type : function() { return typenames.AND_PHRASE; },

  /**
   * Executes this node in the dna.
   * @return {boolean} Result of lhs and rhs anded together.
   **/
  execute : function(sysvars) {
    return this.lhs.execute(sysvars) && this.rhs.execute(sysvars);
  },

  /**
   * Parses this node into a human-readable string.
   * @return {String} Pretty-printed result.
   **/
  toString : function() {
    return 'AndPhrase(' +
      this.lhs.toString() + ' and ' + this.rhs.toString() + ')';
  },
};

/**
 * Creates an And-Phrase node using the lhs and rhs nodes.
 * @param {OrPhrase} lhs - Node representing the left-hand side of the and
 *                         expression.
 * @param {OrPhrase} rhs - Node representing the right-hand side of the and
 *                         expression.
 * @return {AndPhrase} The AST node representing an AndPhrase cond expression.
 **/
module.exports.createAndPhrase = function(lhs, rhs) {
  return {
    __proto__ : AndPhrase.prototype,
    lhs       : lhs,
    rhs       : rhs,
  };
};
