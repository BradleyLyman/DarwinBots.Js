var tokenizer = function(code_string) {
  return code_string.trim().split(/\s+/);
};

module.exports = tokenizer;
