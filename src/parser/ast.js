/**
 * Contains method for creating nodes for the abstract syntax tree.
 * @module Parser/Ast
 **/

/**
 * Creates dna node with the given array of gene nodes.
 **/
module.exports.createDna = function(genes) {
  return {
    type     : 'Dna',
    genes    : genes,
    toString : function() {
      var dnaString = "Dna Start:\n\n";

      genes.forEach(function(gene) {
        dnaString += gene.toString();
        dnaString += "\n";
      });

      return dnaString + "Dna End";
    }
  };
};

/**
 * Creates gene node using the given cond and body expression nodes.
 **/
module.exports.createGene = function(condExpression, bodyExpressions) {
  return {
    type            : 'Gene',
    condExpression  : condExpression,
    bodyExpressions : bodyExpressions,
    toString        : function() {
      var body = "Gene(\n  Cond(\n";

      if (condExpression) {
        body += "    " + condExpression.toString() + "\n";
      }

      body += "  )\n";
      body += "  Body(\n";
      bodyExpressions.forEach(function(expression) {
        body += "    " + expression.toString() + "\n";
      });

      body += "  )\n)";
      return body;
    }
  };
};

/**
 * Creates a node representing an empty conditional statement.
 **/
module.exports.createEmptyCond = function() {
  return {
    type     : 'EmptyCond',
    toString : function() {
      return "";
    }
  };
};

/**
 * Creates an And-Phrase node using the lhs and rhs Or-Phrase nodes.
 **/
module.exports.createAndPhrase = function(lhs, rhs) {
  return {
    type     : 'AndPhrase',
    lhs      : lhs,
    rhs      : rhs,
    toString : function() {
      return "AndPhrase(" + lhs.toString() + " and " + rhs.toString() + ")";
    }
  };
};

/**
 * Creates an Or-Phrase node using the lhs and rhs nodes.
 **/
module.exports.createOrPhrase = function(lhs, rhs) {
  return {
    type     : 'OrPhrase',
    lhs      : lhs,
    rhs      : rhs,
    toString : function() {
      return "OrPhrase(" + lhs.toString() + " Or " + rhs.toString() + ")";
    }
  };
};

/**
 * Creates an expression evaluating equality using exp1 and exp2 nodes.
 **/
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

/**
 * Creates an expression showing exp1 < exp2.
 **/
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

/**
 * Creates an expression showing exp1 > exp2.
 **/
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

/**
 * Creates an expression showing exp1 >= exp2.
 **/
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

/**
 * Creates an expression showing exp1 <= exp2.
 **/
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

/**
 * Creates an expression showing exp1 != exp2.
 **/
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
