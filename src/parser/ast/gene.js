'use strict';
/**
 * Exports a factor method for creating an AST node representing a gene.
 * @module Parser/Ast/gene
 **/
let typenames = require('./typenames.js');

/** @class Gene **/
let Gene = {};

Gene.prototype = {
  /** @lends Gene **/

  /**
   * The type of this node -- useful for debugging
   * and prety-printing.
   * @return {String} This node's type name.
   **/
  type : function() { return typenames.GENE; },

  /**
   * Executes this node in the dna.
   * Executes the cond, if true then all body expressions
   * are executed sequentially.
   * @param {Object} sysvars - Object representing the bot's state to
   *                           the dna.
   **/
  execute : function(sysvars) {
    let result = this.conds.reduce((total, cond) => {
      return total && cond.execute(sysvars);
    }, true);

    if (result) {
      this.bodyStmts.forEach(function(bodyStmt) {
        bodyStmt.execute(sysvars);
      });
    }
  },

  /**
   * Parses this node into a human-readable string.
   * @return {String} Pretty-printed result.
   **/
  toString : function() {
    let body = "Gene(\n  Cond(\n";

    this.conds.forEach((cond) => {
      body += "    " + cond.toString() + "\n";
    });

    body += "  )\n";
    body += "  Body(\n";
    this.bodyStmts.forEach(function(expression) {
      body += "    " + expression.toString() + "\n";
    });

    body += "  )\n)";
    return body;
  },
};

/**
 * Creates a gene node using the given cond and body expression nodes.
 * @param {Array<Cond>} cond - The gene's cond statements.
 * @param {Array<BodyStmt>} bodyStmts - The body statements.
 * @return {Gene} The created gene.
 **/
module.exports.createGene = function(conds, bodyStmts) {
  return {
    __proto__ : Gene.prototype,
    conds     : conds,
    bodyStmts : bodyStmts,
  };
};
