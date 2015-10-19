/**
 * Exports a map of AST node typenames.
 * @module Parser/Ast/typenames
 **/
let keyMirror = require('keymirror');

let astTypes = keyMirror({
  DNA          : null,
  GENE         : null,
  EMPTY_COND   : null,
  AND_PHRASE   : null,
  OR_PHASE     : null,
  E_COND_EXPR  : null,
  G_COND_EXPR  : null,
  L_COND_EXPR  : null,
  GE_COND_EXPR : null,
  LE_COND_EXPR : null,
  NE_COND_EXPR : null,
});

module.exports = astTypes;
