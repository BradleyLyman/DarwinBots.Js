'use strict';
/**
 * Exports a factor function for creating a Dna ast node.
 * @module Parser/Ast/dna
 **/
let typenames = require('./typenames.js');

/** @class Dna **/
let Dna = {};

Dna.prototype = {
  /** @lends Dna **/

  /**
   * The type of this node -- useful for debugging
   * and pretty-printing.
   * @return {String} This node's type name.
   **/
  type : function () { return typenames.DNA; },

  /**
   * Executes this node in the dna.
   * Executes each gene sequentially.
   * @param {Object} sysvars - Object representing the bot's state to
   *                           the dna.
   **/
  execute : function(sysvars) {
    this.genes.forEach(function(gene) {
      gene.execute(sysvars);
    });
  },

  /**
   * Parses this node into a human-readable string.
   * @return {String} Prety-printed result.
   **/
  toString : function () {
    let dnaString = "Dna Start:\n\n";

    this.genes.forEach(function(gene) {
      dnaString += gene.toString();
      dnaString += "\n";
    });

    return dnaString + "Dna End";
  },
};

/**
 * Factory method which creates a new dna ast node.
 * @param {Array<Gene>} genes - An array of gene ast nodes.
 * @returns {Dna} Dna node with the genes provided.
 **/
module.exports.createDna = function(genes) {
  return {
    __proto__ : Dna.prototype,
    genes     : genes,
  };
};
