'use strict';
/**
 * Exports factor functions for creating an assortment of conditional
 * statements.
 * @module Parser/Ast/condExpressions
 **/
let typenames = require('./typenames.js');


/** @class CondExpression **/
let CondExpression = {};

CondExpression.prototype = {
  /** @lends CondExpression **/

  /**
   * Parses this condExpression node into a human-readable string.
   * @return {String} A pretty-printed string representing the expression.
   **/
  toString : function() {
    return this.type() + "(" +
      this.lhs.toString() + ", " + this.rhs.toString() + ")";
  },
};

/** @class ECondExpr **/
let ECondExpr = {};

ECondExpr.prototype = {
  __proto__ : CondExpression.prototype,

  /** @lends ECondExpr **/

  /**
   * The type of this ast node.
   * @return {String} The nypename of this node.
   **/
  type : function() { return typenames.E_COND_EXPR; },

  /**
   * Executes the expression and returns the result.
   * @return {boolean} Returns lhs === rhs.
   **/
  execute : function(sysvars) {
    return this.lhs.execute(sysvars) === this.rhs.execute(sysvars);
  },
};

/** @class LCondExpr **/
let LCondExpr = {};

LCondExpr.prototype = {
  __proto__ : CondExpression.prototype,

  /** @lends LCondExpr **/

  /**
   * The type of this ast node.
   * @return {String} The nypename of this node.
   **/
  type : function() { return typenames.L_COND_EXPR; },

  /**
   * Executes the expression and returns the result.
   * @return {boolean} Returns lhs < rhs.
   **/
  execute : function(sysvars) {
    return this.lhs.execute(sysvars) < this.rhs.execute(sysvars);
  },
};

/** @class GCondExpr **/
let GCondExpr = {};

GCondExpr.prototype = {
  __proto__ : CondExpression.prototype,

  /** @lends GCondExpr **/

  /**
   * The type of this ast node.
   * @return {String} The nypename of this node.
   **/
  type : function() { return typenames.G_COND_EXPR; },

  /**
   * Executes the expression and returns the result.
   * @return {boolean} Returns lhs > rhs.
   **/
  execute : function(sysvars) {
    return this.lhs.execute(sysvars) > this.rhs.execute(sysvars);
  },
};

/** @class GECondExpr **/
let GECondExpr = {};

GECondExpr.prototype = {
  __proto__ : CondExpression.prototype,

  /** @lends GECondExpr **/

  /**
   * The type of this ast node.
   * @return {String} The nypename of this node.
   **/
  type : function() { return typenames.GE_COND_EXPR; },

  /**
   * Executes the expression and returns the result.
   * @return {boolean} Returns lhs >= rhs.
   **/
  execute : function(sysvars) {
    return this.lhs.execute(sysvars) >= this.rhs.execute(sysvars);
  },
};

/** @class LECondExpr **/
let LECondExpr = {};

LECondExpr.prototype = {
  __proto__ : CondExpression.prototype,

  /** @lends LECondExpr **/

  /**
   * The type of this ast node.
   * @return {String} The nypename of this node.
   **/
  type : function() { return typenames.LE_COND_EXPR; },

  /**
   * Executes the expression and returns the result.
   * @return {boolean} Returns lhs <= rhs.
   **/
  execute : function(sysvars) {
    return this.lhs.execute(sysvars) <= this.rhs.execute(sysvars);
  },
};

/** @class NECondExpr **/
let NECondExpr = {};

NECondExpr.prototype = {
  __proto__ : CondExpression.prototype,

  /** @lends NECondExpr **/

  /**
   * The type of this ast node.
   * @return {String} The nypename of this node.
   **/
  type : function() { return typenames.NE_COND_EXPR; },

  /**
   * Executes the expression and returns the result.
   * @return {boolean} Returns lhs !== rhs.
   **/
  execute : function(sysvars) {
    return this.lhs.execute(sysvars) !== this.rhs.execute(sysvars);
  },
};


/**
 * Creates an AST node representing the cond expression.
 * @param {Expression} lhs - Left hand side of the condition.
 * @param {EXpression} rhs - Right hand side of the condition.
 * @return {ECondExpr} The condition expression node.
 **/
module.exports.createECondExpr = function(lhs, rhs) {
  return {
    __proto__ : ECondExpr.prototype,
    lhs       : lhs,
    rhs       : rhs,
  };
};

/**
 * Creates an AST node representing the cond expression.
 * @param {Expression} lhs - Left hand side of the condition.
 * @param {Expression} rhs - Right hand side of the condition.
 * @return {LCondExpr} The condition expression node.
 **/
module.exports.createLCondExpr = function(lhs, rhs) {
  return {
    __proto__ : LCondExpr.prototype,
    lhs       : lhs,
    rhs       : rhs,
  };
};

/**
 * Creates an AST node representing the cond expression.
 * @param {Expression} lhs - Left hand side of the condition.
 * @param {Expression} rhs - Right hand side of the condition.
 * @return {GCondExpr} The condition expression node.
 **/
module.exports.createGCondExpr = function(lhs, rhs) {
  return {
    __proto__ : GCondExpr.prototype,
    lhs       : lhs,
    rhs       : rhs,
  };
};

/**
 * Creates an AST node representing the cond expression.
 * @param {Expression} lhs - Left hand side of the condition.
 * @param {Expression} rhs - Right hand side of the condition.
 * @return {GECondExpr} The condition expression node.
 **/
module.exports.createGECondExpr = function(lhs, rhs) {
  return {
    __proto__ : GECondExpr.prototype,
    lhs       : lhs,
    rhs       : rhs,
  };
};

/**
 * Creates an AST node representing the cond expression.
 * @param {Expression} lhs - Left hand side of the condition.
 * @param {Expression} rhs - Right hand side of the condition.
 * @return {LECondExpr} The condition expression node.
 **/
module.exports.createLECondExpr = function(lhs, rhs) {
  return {
    __proto__ : LECondExpr.prototype,
    lhs       : lhs,
    rhs       : rhs,
  };
};

/**
 * Creates an AST node representing the cond expression.
 * @param {Expression} lhs - Left hand side of the condition.
 * @param {Expression} rhs - Right hand side of the condition.
 * @return {NECondExpr} The condition expression node.
 **/
module.exports.createNECondExpr = function(lhs, rhs) {
  return {
    __proto__ : NECondExpr.prototype,
    lhs       : lhs,
    rhs       : rhs,
  };
};
