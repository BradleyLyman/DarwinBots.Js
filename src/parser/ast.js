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
