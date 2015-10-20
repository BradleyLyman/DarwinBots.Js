/**
 * Provides methods for creating a sourceManager object which manages a
 * string representing DNA code.
 * @module Parser/SourceManager
 **/
'use strict';
let Result = require('object-result'),
    ok     = Result.createOk,
    err    = Result.createErr;

/**
 * Strips comments out of the source code and replaces them
 * with whitespace. This keeps the cursor and line numbers
 * correct, but prevents us from having to parse these lines.
 * @param {String} source - Raw source code with comments.
 * @return {String} Source code with comments replaced with spaces.
 **/
let stripComments = function(source) {
  let commentMatcher = /('(.*)\n)/g;

  return source.replace(commentMatcher, function(match) {
    return (new Array(match.length)).join(' ') + '\n';
  });
};

/**
 * Searches for newline indicators in the line given.
 * Returns a tuple containing the number of lines in the string, and the index
 * of the character at the beginning of the most recent line (indexOfLastLine).
 * @param {String} line - The line to search for newline chars.
 * @return {Object} { lineCount, indexOfLastLine }
 **/
let processNewline = function(line) {
  let newlineMatcher = /[\n\r]/;
  let lineCount = 0, lastLine = 0;

  let lineResults = line.match(newlineMatcher);

  while (lineResults) {
    lineCount++;
    lastLine += lineResults.index + 1;

    lineResults = line.slice(lastLine).match(newlineMatcher);
  }

  return { lineCount : lineCount, indexOfLastLine : lastLine };
};

/** @class SourceManager **/
let SourceManager = {};

SourceManager.prototype = {
  /** @lends SourceManager **/


  /**
   * Retrieves the character under the cursor.
   * @return {String} The character under the cursor.
   **/
  peek : function() {
    return this.src[this.cursor];
  },

  /**
   * Moves the cursor to the next non-whitespace character and returns
   * that character.
   * @return {String} The character under the cursor.
   **/
  next : function() {
    this.eatWhitespace();

    return this.peek();
  },

  /**
   * Attempts to match the next non-whitespace characters against a regular
   * expression. On success the cursor is incremented past the matched string,
   * on failure the cursor is left in place.
   * @param {String} key - The regular expression to match.
   * @param {String} errName - The name to use for the error, if not-specified
   *                           the key is used as the error's name.
   * @return {Result} Ok value is the matched string, Err value is a message
   *                  describing the error.
   **/
  expect : function(key, errName) {
    this.eatWhitespace();

    let slice = this.src.slice(this.cursor);
    let results = slice.match(key);
    if (!results || results.index !== 0) {
      return err(
        this.errAtCursor("Expected to find " + (errName || key.toString()))
      );
    }

    this.cursor += results[0].length;

    return ok( results[0] );
  },

  /**
   * Verifies that the provided regular expression does not match next sequence
   * of non-whitespace characters. This method does not modify the cursor's
   * location other than to skip whitespace.
   * @param {String} key - The regular expression to match.
   * @param {String} errName - The name to use for the error, if not provided
   *                           then the key is used as the error's name.
   * @return {Result} Ok value is empty (indicating the match was not found),
   *                  Err is a string describing what went wrong.
   **/
  expectNot : function(key, errName) {
    this.eatWhitespace();

    let slice = this.src.slice(this.cursor);
    let results = slice.match(key);
    if (results && results.index === 0) {
      return err( this.errAtCursor("Unexpected " + errName) );
    }

    return ok('');
  },

  /**
   * Increments the cursor past any whitespace immediately following its
   * current position.
   **/
  eatWhitespace : function() {
    let whitespaceMatcher = /(s+)/;
    let currentSlice = this.src.slice(this.cursor);

    let results = currentSlice.match(whitespaceMatcher);
    if (results && results.index === 0) {
      let newLineDesc = processNewline(results[0]);

      this.line += newLineDesc.lineCount;
      if (newLineDesc.lineCount > 0) {
        this.lineStart = this.cursor + newLineDesc.indexOfLastLine;
      }

      this.cursor += results[0].length;
    }
  },

  /**
   * Generates an error message using the cursor's position and the line count
   * to indicate where in the source the error originated.
   * @param {String} err - A custom message to be displayed explaining the err.
   * @return {String} A pre-formated message intended to explain the error --
   *                  it is best viewed with a monospace font.
   **/
  errAtCursor : function(err) {
    let nextNewLine = this.src.length;
    let results = this.src.slice(this.cursor).match(/[\n\r]/);
    if (results) {
      nextNewLine = this.cursor + results.index;
    }

    let line = this.src.slice(this.lineStart, nextNewLine) + "\n";
    let errLen = this.cursor - this.lineStart;
    let errDesc = "Error on line " + this.line + " : " + (errLen + 1) + "\n";

    return errDesc + line + (new Array(errLen)).join(' ') + '^\n' + err;
  }
};

/**
 * Creates a new SourceManager instance.
 * The SourceManager helps with parsing source code by keeping track of how far
 * through the code we have parsed (using the cursor) and what line we are
 * currently on. Helper methods are provided for skipping whitespace, and
 * matching keywords.
 * @param {String} rawSource - Raw source code as read from the file.
 * @return {SourceManager}
 **/
module.exports = function(rawSource) {
  let cleanSource = stripComments(rawSource);

  return {
    __proto__  : SourceManager.prototype,
    src        : cleanSource,
    cursor     : 0,
    lineStart  : 0,
    line       : 1,
    parenCtr   : 0,
    insideGene : 0,
  };
};
