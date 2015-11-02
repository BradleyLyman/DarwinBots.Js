'use strict';
/**
 * Exports factor functions for creating numeric expressions.
 * @module Parser/Ast/expressions
 **/
let typenames = require('./typenames.js');

/** @class BinExpr **/
let BinExpr = {};

BinExpr.prototype = {
  /** @lends BinExpr **/

  /**
   * Writes the expression of two terms as a string.
   * @return {String} String representation of a binary expression.
   **/
  toString : function() {
    return this.type() + "(" +
      this.term1.toString() + ", " +
      this.term2.toString() + ")";
  },
};

/** @class SubExpr **/
let SubExpr = {};

SubExpr.prototype = {
  __proto__ : BinExpr.prototype,
  /** @lends SubExpr **/

  /**
   * Retrieves the expression's type.
   **/
  type : function() { return typenames.SUB_EXPR; },

  /**
   * Executes the expression.
   * @param {Object} sysvars - The bot's state as it is represented tothe DNA.
   * @return {Number} Result of lhs - rhs.
   **/
  execute : function(sysvars) {
    return this.lhs.execute(sysvars) - this.rhs.execute(sysvars);
  },
};

/** @class AddExpr **/
let AddExpr = {};

AddExpr.prototype = {
  __proto__ : BinExpr.prototype,
  /** @lends AddExpr **/

  /**
   * Retrieves the expression's type.
   **/
  type : function() { return typenames.ADD_EXPR; },

  /**
   * Executes the expression.
   * @param {Object} sysvars - The bot's state as it is represented tothe DNA.
   * @return {Number} Result of lhs + rhs.
   **/
  execute : function(sysvars) {
    return this.lhs.execute(sysvars) + this.rhs.execute(sysvars);
  },
};

/** @class MulExpr **/
let MulExpr = {};

MulExpr.prototype = {
  __proto__ : BinExpr.prototype,
  /** @lends MulExpr **/

  /**
   * Retrieves the expression's type.
   **/
  type : function() { return typenames.MUL_EXPR; },

  /**
   * Executes the expression.
   * @param {Object} sysvars - The bot's state as it is represented tothe DNA.
   * @return {Number} Result of lhs * rhs.
   **/
  execute : function(sysvars) {
    return this.lhs.execute(sysvars) * this.rhs.execute(sysvars);
  },
};

/** @class DivExpr **/
let DivExpr = {};

DivExpr.prototype = {
  __proto__ : BinExpr.prototype,
  /** @lends DivExpr **/

  /**
   * Retrieves the expression's type.
   **/
  type : function() { return typenames.DIV_EXPR; },

  /**
   * Executes the expression.
   * @param {Object} sysvars - The bot's state as it is represented tothe DNA.
   * @return {Number} Result of lhs / rhs.
   **/
  execute : function(sysvars) {
    return this.lhs.execute(sysvars) / this.rhs.execute(sysvars);
  },
};

/** @class PowExpr **/
let PowExpr = {};

PowExpr.prototype = {
  __proto__ : BinExpr.prototype,
  /** @lends PowExpr **/

  /**
   * Retrieves the expression's type.
   **/
  type : function() { return typenames.POW_EXPR; },

  /**
   * Executes the expression.
   * @param {Object} sysvars - The bot's state as it is represented tothe DNA.
   * @return {Number} Result of math.pow(lhs, rhs).
   **/
  execute : function(sysvars) {
    return Math.pow(this.lhs.execute(sysvars), this.rhs.execute(sysvars));
  },
};

/** @class UMinusExpr **/
let UMinusExpr = {};

UMinusExpr.prototype = {
  /** @lends UMinusExpr **/

  /**
   * Retrieves the expression's type.
   **/
  type : function() { return typenames.UMINUS_EXPR; },

  /**
   * Executes the unary minus expression.
   * @param {Object} sysvars - The bot's state as it is represented to the DNA.
   * @return {Number} Result of -expression.
   **/
  execute : function(sysvars) {
    return -this.expression.execute(sysvars);
  },

  /**
   * Creates a human-readable representation of the unary expression.
   * @return {String} Pretty-printed form of this node.
   **/
  toString : function() {
    return "Minus(" + this.expression.toString() + ")";
  },
};

/** @class Literal **/
let Literal = {};

Literal.prototype = {
  /** @lends Literal **/

  /**
   * Retrieves the expression's type.
   **/
  type : function() { return typenames.LITERAL; },

  /**
   * Simply returns the value of the literal.
   * @return {Number} The literal's value.
   **/
  execute : function() {
    return this.value;
  },

  /**
   * Creates a human-readable representation of the literal.
   * @return {String} Pretty-printed form of this node.
   **/
  toString : function() {
    return "Literal(" + this.value + ")";
  },
};

/** @class Variable **/
let Variable = {};

Variable.prototype = {
  /** @lends Variable **/

  /**
   * Retrieves the expression's type.
   **/
  type : function() { return typenames.VARIABLE; },

  /**
   * Reads the value stored in the variables location
   * in the sysvars.
   * @param {Object} sysvars - The bot dna's view of the bot's state.
   * @return {Number} The value of the variable (0 if undefined).
   **/
  execute : function(sysvars) {
    return sysvars[this.name] || 0;
  },

  /**
   * Creates a human-readable representation of the variable.
   * @return {String} Pretty-printed form of this node.
   **/
  toString : function() {
    return "Variable(" + this.name + ")";
  },
};


/**
 * Creates the ast node specified.
 * @param {Expression} lhs - The left-hand side of the expression.
 * @param {Expression} rhs - The right-hand side of the expression.
 * @return {DivExpr} The expression.
 **/
module.exports.createDivExpr = function(lhs, rhs) {
  return {
    __proto__ : DivExpr.prototype,
    lhs       : lhs,
    rhs       : rhs,
  };
};

/**
 * Creates the ast node specified.
 * @param {Expression} lhs - The left-hand side of the expression.
 * @param {Expression} rhs - The right-hand side of the expression.
 * @return {MulExpr} The expression.
 **/
module.exports.createMulExpr = function(lhs, rhs) {
  return {
    __proto__ : MulExpr.prototype,
    lhs       : lhs,
    rhs       : rhs,
  };
};

/**
 * Creates the ast node specified.
 * @param {Expression} lhs - The left-hand side of the expression.
 * @param {Expression} rhs - The right-hand side of the expression.
 * @return {AddExpr} The expression.
 **/
module.exports.createAddExpr = function(lhs, rhs) {
  return {
    __proto__ : AddExpr.prototype,
    lhs       : lhs,
    rhs       : rhs,
  };
};

/**
 * Creates the ast node specified.
 * @param {Expression} lhs - The left-hand side of the expression.
 * @param {Expression} rhs - The right-hand side of the expression.
 * @return {SubExpr} The expression.
 **/
module.exports.createSubExpr = function(lhs, rhs) {
  return {
    __proto__ : SubExpr.prototype,
    lhs       : lhs,
    rhs       : rhs,
  };
};

/**
 * Creates the ast node specified.
 * @param {Expression} lhs - The left-hand side of the expression.
 * @param {Expression} rhs - The right-hand side of the expression.
 * @return {PowExpr} The expression.
 **/
module.exports.createPowExpr = function(lhs, rhs) {
  return {
    __proto__ : PowExpr.prototype,
    lhs       : lhs,
    rhs       : rhs,
  };
};

/**
 * Creates the ast node specified.
 * @param {Expression} expression - The expression to negate.
 * @return {UMinusExpr} The expression.
 **/
module.exports.createUMinusExpr = function(expression) {
  return {
    __proto__  : UMinusExpr.prototype,
    expression : expression,
  };
};

/**
 * Creates the ast node representing a numeric literal.
 * @param {Number} value - The literal value.
 * @return {Literal} The literal expression node.
 **/
module.exports.createLiteral = function(value) {
  return {
    __proto__ : Literal.prototype,
    value     : value,
  };
};

/**
 * Creates the ast node representing a variable.
 * @param {String} name - The variable name.
 * @return {Variable} The Variable node.
 **/
module.exports.createVariable = function(name) {
  if (name === "rnd") {
    return {
      __proto__ : Variable.prototype,
      name      : name,
      execute   : function(sysvars) {
        let raw = sysvars["rnd"] || 0;
        return Math.random() * raw;
      },
    };
  }

  return {
    __proto__ : Variable.prototype,
    name      : name,
  };
};
