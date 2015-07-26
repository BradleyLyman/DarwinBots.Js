/**
 * Creates an object which represents a finite stack.
 * Params:
 *   defaultVal - default value to be returned if an empty stack is popped - default 0
 *   maxSize    - maximum stack size - default 20
 * Returns:
 *   Stack object with 2 methods. One for pushing to the stack and one for popping
 *   from the stack.
 *   Object also has the stack object which is just a regular js array.
 **/
module.exports = function(defaultVal, maxSize) {
  maxSize    = maxSize === undefined ? 20 : maxSize;
  defaultVal = defaultVal === undefined ? 0 : defaultVal;

  return {
    stack : [],
    pop   : function() {
      var val = this.stack.pop();
      if (val === undefined) {
        return defaultVal;
      }
      return val;
    },
    push  : function(val) {
      this.stack.push(val);

      if (this.stack.length > maxSize) {
        this.stack.splice(0, 1);
      }
    },
    length : function() {
      return this.stack.length;
    }
  };
};
