
module.exports.createGene = function(bodyExpressions) {
  return {
    type            : 'Gene',
    bodyExpressions : bodyExpressions,
    toString        : function() {
      var body = "Gene(\n  Body(\n";

      bodyExpressions.forEach(function(expression) {
        body += "    " + expression.toString() + "\n";
      });

      body += "  )\n)";
      return body;
    }
  };
};

module.exports.createEqualExpr = function(exp1, exp2) {
  return {
    type     : 'EqualExpr',
    exp1     : exp1,
    exp2     : exp2,
    toString : function() {
      return "EqualExpr(" + exp1.toString() + " = " + exp2.toString() + ")";
    }
  };
};

module.exports.createLessExpr = function(exp1, exp2) {
  return {
    type     : 'LessExpr',
    exp1     : exp1,
    exp2     : exp2,
    toString : function() {
      return "LessExpr(" + exp1.toString() + " < " + exp2.toString() + ")";
    }
  };
};

module.exports.createGreaterExpr = function(exp1, exp2) {
  return {
    type     : 'GreaterExpr',
    exp1     : exp1,
    exp2     : exp2,
    toString : function() {
      return "GreaterExpr(" + exp1.toString() + " > " + exp2.toString() + ")";
    }
  };
};

module.exports.createGEExpr = function(exp1, exp2) {
  return {
    type     : 'GEExpr',
    exp1     : exp1,
    exp2     : exp2,
    toString : function() {
      return "GEExpr(" + exp1.toString() + " >= " + exp2.toString() + ")";
    }
  };
};

module.exports.createLEExpr = function(exp1, exp2) {
  return {
    type     : 'LEExpr',
    exp1     : exp1,
    exp2     : exp2,
    toString : function() {
      return "LEExpr(" + exp1.toString() + " <= " + exp2.toString() + ")";
    }
  };
};

module.exports.createNEExpr = function(exp1, exp2) {
  return {
    type     : 'NEExpr',
    exp1     : exp1,
    exp2     : exp2,
    toString : function() {
      return "NEExpr(" + exp1.toString() + " != " + exp2.toString() + ")";
    }
  };
};

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

module.exports.createNumber = function(val) {
  return {
    type     : 'Number',
    value    : val,
    toString : function() { return "Number(" + val + ")"; }
  };
};

module.exports.createDivExpr = function(factor1, factor2) {
  return {
    type     : 'DivExpr',
    factor1  : factor1,
    factor2  : factor2,
    toString : function() {
      return "DivExpr(" + factor1.toString() + " / " + factor2.toString() + ")";
    }
  };
};

module.exports.createMulExpr = function(factor1, factor2) {
  return {
    type     : 'MulExpr',
    factor1  : factor1,
    factor2  : factor2,
    toString : function() {
      return "MulExpr(" + factor1.toString() + " * " + factor2.toString() + ")";
    }
  };
};

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

module.exports.createPowExpr = function(base, exp) {
  return {
    type     : 'PowExpr',
    base     : base,
    exp      : exp,
    toString : function() {
      return "PowExpr(" + base.toString() + " ^ " + exp.toString() + ")";
    }
  };
};

module.exports.createUnaryMinus = function(unary) {
  return {
    type     : 'Minus',
    unary    : unary,
    toString : function() {
      return "Minus(" + unary.toString() + ")";
    }
  };
};

module.exports.createVariable = function(name) {
  return {
    type     : 'Variable',
    name     : name,
    toString : function() {
      return "Variable(" + name + ")";
    }
  };
};
