/**
 * @module compiler
 * Contains functions for compiling an AST into executable
 * javascript.
 **/

var Ast    = require('./ast.js'),
    Result = require('object-result'),
    Ok     = Result.Ok,
    Err    = Result.Err;

/**
 * Compiles the dna node into a single executable function.
 * The returned function accepts an object representing the
 * bot's state.
 * @return {function} A function which takes a 'sysvars' object.
 **/
module.exports.compileDna = function(dnaNode) {
  var geneFuncs = dnaNode.genes.map(function(gene, index) {
    return compileGene(gene);
  });

  return function(sysvars) {
    geneFuncs.forEach(function(gene) {
      gene(sysvars);
    });
  };
};

/**
 * Compiles genes into executable functions.
 * @return {function} a function which takes a 'sysvars' object.
 **/
var compileGene = function(gene) {
  var bodyExprFuncs = gene.bodyExpressions.map(function(bodyExpression) {
    return compileBodyExpression(bodyExpression);
  });

  if (gene.condExpression.type === 'EmptyCond') {
    return function(sysvars) {
      bodyExprFuncs.forEach(function(bodyExprFunc) {
        bodyExprFunc(sysvars);
      });
    };
  }

  var condExprFunc = compileCondExpression(gene.condExpression);

  return function(sysvars) {
    if (condExprFunc(sysvars) === true) {
      bodyExprFuncs.forEach(function(bodyExprFunc) {
        bodyExprFunc(sysvars);
      });
    }
  };
};

var compileCondExpression = function(condExpr) {
  switch (condExpr.type) {
    case 'AndPhrase':
    case 'OrPhrase':
      return compilePhrase(condExpr);

    case 'EqualExpr':
    case 'LessExpr':
    case 'GreaterExpr':
    case 'GEExpr':
    case 'LEExpr':
    case 'NEExpr':
      return compileBoolExpr(condExpr);

    default:
      return compileExprNode(condExpr);
  }
};

var compileBoolExpr = function(condExpr) {
  var exp1 = compileCondExpression(condExpr.exp1);
  var exp2 = compileCondExpression(condExpr.exp2);

  switch (condExpr.type) {
    case 'EqualExpr':
      return function(sysvars) { return exp1(sysvars) === exp2(sysvars); };
    case 'LessExpr':
      return function(sysvars) { return exp1(sysvars) < exp2(sysvars); };
    case 'GreaterExpr':
      return function(sysvars) { return exp1(sysvars) > exp2(sysvars); };
    case 'GEExpr':
      return function(sysvars) { return exp1(sysvars) >= exp2(sysvars); };
    case 'LEExpr':
      return function(sysvars) { return exp1(sysvars) <= exp2(sysvars); };
    case 'NEExpr':
      return function(sysvars) { return exp1(sysvars) !== exp2(sysvars); };
  }
};

var compilePhrase = function(condExpr) {
  var lhs = compileCondExpression(condExpr.lhs);
  var rhs = compileCondExpression(condExpr.rhs);

  if (condExpr.type === 'AndPhrase') {
    return function(sysvars) {
      return lhs(sysvars) && rhs(sysvars);
    };
  } else {
    return function(sysvars) {
      return lhs(sysvars) || rhs(sysvars);
    };
  }
};

/**
 * Compiles a bodyExpression into an executable function.
 * @return (function) a function which takes a 'sysvars' object.
 **/
var compileBodyExpression = function(bodyExpr) {
  var variableName = bodyExpr.variable.name;
  var expression   = compileExprNode(bodyExpr.expression);

  return function(sysvars) {
    sysvars[variableName] = expression(sysvars);
  };
};

/**
 * Compiles the node into function using the node's type to determine
 * how to compile.
 * @return {function} a function which takes a 'sysvars' object.
 **/
var compileExprNode = function(node) {
  switch (node.type) {
    case 'DivExpr':
    case 'MulExpr':
    case 'AddExpr':
    case 'SubExpr':
    case 'PowExpr':
      return compileExpression(node);

    case 'Minus':
      return compileMinus(node);

    case 'Variable':
      return compileVariable(node);

    case 'Number':
      return function(sysvars) {
        return node.value;
      };
  }
};

var compileMinus = function(node) {
  var unary = compileExprNode(node.unary);

  return function(sysvars) {
    return -unary(sysvars);
  };
};

var compileVariable = function(variable) {
  var name = variable.name;

  if (name === 'rnd') {
    return function(sysvars) {
      return Math.random() * sysvars.rnd;
    };
  }

  return function(sysvars) {
    return sysvars[name] || 0;
  };
};

var compileExpression = function(node) {
  var term1 = compileExprNode(node.term1);
  var term2 = compileExprNode(node.term2);

  switch (node.type) {
    case 'DivExpr':
      return function(sysvars) {
        return term1(sysvars) / term2(sysvars);
      };

    case 'MulExpr':
      return function(sysvars) {
        return term1(sysvars) * term2(sysvars);
      };

    case 'AddExpr':
      return function(sysvars) {
        return term1(sysvars) + term2(sysvars);
      };

    case 'SubExpr':
      return function(sysvars) {
        return term1(sysvars) - term2(sysvars);
      };

    case 'PowExpr':
      return function(sysvars) {
        return Math.pow(term1(sysvars), term2(sysvars));
      };
  }
};














