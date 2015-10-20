'use strict';
/**
 * Exports a factory function for creating an empty conditional block.
 * @module Parser/Ast/emptyCond
 **/
let typenames = require('./typenames.js');

/** @class EmptyCond **/
let EmptyCond = {};

EmptyCond.prototype = {
  /** @lends EmptyCond **/

  /**
   * The type of this node -- useful for debugging
   * and pretty-printing.
   * @return {String} This node's type name.
   **/
  type : function() { return typenames.EMPTY_COND; },

  /**
   * Executes this node in the dna.
   * This node is a no-op that always returns true.
   * @return {boolean} Always returns true.
   **/
  execute : function() {
    return true;
  },

  /**
   * Parses this node of the AST into a human-readable string.
   * @return {String} Pretty-Printed result.
   **/
  toString : function() {
    return "EmptyCond()";
  },
};

/**
 * Creates a node representing an empty conditional statement.
 * @return {EmptyCond} The emptycond node.
 **/
module.exports.createEmptyCond = function() {
  return {
    __proto__ : EmptyCond.prototype,
  };
};
