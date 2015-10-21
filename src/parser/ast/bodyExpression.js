'use strict';
/**
 * Exports a factory function for creating a body expression from a variable
 * and an expression.
 * @module Parser/Ast/bodyExpression
 **/
let typenames = require('./typenames.js');

/** @class BodyExpression **/
let BodyExpression = {};

BodyExpression.prototype = {
  /** @lends BodyExpression **/

  /**
   * The type of this node -- useful for debugging and
   * pretty-printing.
   * @return {String} This node's type name.
   **/
  type : function() { return typenames.BODY_EXPR; },

  /**
   * Executes this node in the dna.
   * @param {Object} sysvars - Object representing the bot's state to the dna.
   **/
  execute : function(sysvars) {
    sysvars[this.variable.name] = this.expression.execute(sysvars);
  },

  /**
   * Parses this node into a human-readable string.
   * @return {String} Pretty-printed string.
   **/
  toString : function() {
    return "BodyExpression: " + this.variable.toString() + " <- " +
      this.expression.toString();
  },
};

/**
 * Creates a node representing a body expression.
 * @param {Variable} variable - A node representing a variable.
 * @param {Expression} expression - An expression who's value will be stored
 *                                  in the variable.
 * @return {BodyExpression} The body expression variable <- expression.
 **/
module.exports.createBodyExpression = function(variable, expression) {
  return {
    __proto__  : BodyExpression.prototype,
    variable   : variable,
    expression : expression,
  };
};
