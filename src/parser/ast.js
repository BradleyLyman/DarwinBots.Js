/**
 * Creates an node representing a body expression of the form
 * variable <- expression.
 **/
module.exports.createBodyExpression = function(variable, expression) {
  return {
    type       : 'BodyExpression',
    variable   : variable,
    expression : expression,
    toString   : function() {
      return "BodyExpression: " + variable.toString() + " <- " + expression.toString();
    }
  };
};

/**
 * Creates a node representing a single numeric value.
 **/
module.exports.createNumber = function(val) {
  return {
    type     : 'Number',
    value    : val,
    toString : function() { return "Number(" + val + ")"; }
  };
};

/**
 * Creates a node representing division between the first and second factors.
 **/
module.exports.createDivExpr = function(factor1, factor2) {
  return {
    type     : 'DivExpr',
    term1    : factor1,
    term2    : factor2,
    toString : function() {
      return "DivExpr(" + factor1.toString() + " / " + factor2.toString() + ")";
    }
  };
};

/**
 * Creates a node representing multiplication between the first and second
 * factors.
 **/
module.exports.createMulExpr = function(factor1, factor2) {
  return {
    type     : 'MulExpr',
    term1    : factor1,
    term2    : factor2,
    toString : function() {
      return "MulExpr(" + factor1.toString() + " * " + factor2.toString() + ")";
    }
  };
};

/**
 * Creates a node representing addition between the first and second terms.
 **/
module.exports.createAddExpr = function(term1, term2) {
  return {
    type     : 'AddExpr',
    term1    : term1,
    term2    : term2,
    toString : function() {
      return "AddExpr(" + term1.toString() + " + " + term2.toString() + ")";
    }
  };
};

/**
 * Creates a node representing subtraction between term1 and term2.
 **/
module.exports.createSubExpr = function(term1, term2) {
  return {
    type     : 'SubExpr',
    term1    : term1,
    term2    : term2,
    toString : function() {
      return "SubExpr(" + term1.toString() + " - " + term2.toString() + ")";
    }
  };
};

/**
 * Creates a node representing base ^ pow between a unary and a factor.
 **/
module.exports.createPowExpr = function(base, exp) {
  return {
    type     : 'PowExpr',
    term1    : base,
    term2    : exp,
    toString : function() {
      return "PowExpr(" + base.toString() + " ^ " + exp.toString() + ")";
    }
  };
};

/**
 * Creates a node representing a negated value.
 **/
module.exports.createUnaryMinus = function(unary) {
  return {
    type     : 'Minus',
    unary    : unary,
    toString : function() {
      return "Minus(" + unary.toString() + ")";
    }
  };
};

/**
 * Creates a node representing a variable.
 **/
module.exports.createVariable = function(name) {
  return {
    type     : 'Variable',
    name     : name,
    toString : function() {
      return "Variable(" + name + ")";
    }
  };
};
