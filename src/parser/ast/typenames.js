'use strict';
/**
 * Exports a map of AST node typenames.
 * @module Parser/Ast/typenames
 **/
let keyMirror = require('keymirror');

let astTypes = keyMirror({
  DNA          : null,
  GENE         : null,
  AND_PHRASE   : null,
  OR_PHRASE    : null,
  E_COND_EXPR  : null,
  G_COND_EXPR  : null,
  L_COND_EXPR  : null,
  GE_COND_EXPR : null,
  LE_COND_EXPR : null,
  NE_COND_EXPR : null,
  ADD_EXPR     : null,
  SUB_EXPR     : null,
  DIV_EXPR     : null,
  MUL_EXPR     : null,
  POW_EXPR     : null,
  UMINUS_EXPR  : null,
  LITERAL      : null,
  VARIABLE     : null,
  BODY_EXPR    : null,
});

module.exports = astTypes;
