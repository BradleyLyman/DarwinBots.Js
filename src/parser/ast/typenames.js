/**
 * Exports a map of AST node typenames.
 * @module Parser/Ast/typenames
 **/
let keyMirror = require('keymirror');

let astTypes = keyMirror({
  DNA        : null,
  GENE       : null,
  EMPTY_COND : null,
  AND_PHRASE : null
});

module.exports = astTypes;
