/**
 * Provides methods for creating a sourceManager object which manages a
 * string representing DNA code.
 * @module Parser/SourceManager
 **/

var Result = require('object-result'),
    Ok     = Result.Ok,
    Err    = Result.Err;

/**
 * Strips comments out of the source code and replaces them
 * with whitespace. This keeps the cursor and line numbers
 * correct, but prevents us from having to parse these lines.
 * @param {String} source - Raw source code with comments.
 * @return {String} Source code with comments replaced with spaces.
 **/
var stripComments = function(source) {
  var commentMatcher = /('(.*)\n)/g;

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
var processNewline = function(line) {
  var newlineMatcher = /[\n\r]/;
  var lineCount = 0, lastLine = 0;

  var lineResults = line.match(newlineMatcher);

  while (lineResults) {
    lineCount++;
    lastLine += lineResults.index + 1;

    lineResults = line.slice(lastLine).match(newlineMatcher);
  }

  return { lineCount : lineCount, indexOfLastLine : lastLine };
};

/**
 * @typedef SourceManager
 * @type {Object}
 * @property {String} src - Source code stripped of comments.
 * @property {Number} cursor - Current location in the code, used by the parser.
 * @property {Number} lineStart - Cursor location of the start of the line.
 * @property {Number} line - Current line number.
 * @property {Number} parenCtr - Tracks unclosed parens -- used for
 *                               error checking within the parser.
 * @property {Number} insideGene - Flag, tracks if the parser is currently
 *                                 parsing code inside of a gene. This is used
 *                                 for error checking within the parser.
 * @property {Function} peek - Look at the character under the cursor.
 * @property {Function} next - Skips whitespace and returns the next
 *                             non-whitespace character.
 * @property {ExpectCallback} expect - Matches a regex against the next
 *                                     non-whitespace characters.
 * @property {ExpectNotCallback} expectNot - Ensures that the next
 *                                           non-whitespace characters do not
 *                                           match the given regex.
 * @property {Function} eatWhitespace - Skips whitespace until a non-whitespace
 *                                      character is reached. Moves the cursor
 *                                      and increments the line count
 *                                      accordingly.
 * @property {ErrCallback} errAtCursor - Creates an error message which shows
 *                                       the current line and character with
 *                                       the error displayed below.
 **/

/**
 * Matches a regex against the next non-whitespace characters in the source
 * code. If a match is found then the matched string is returned and the
 * cursor is incremented, otherwise an error is returned and the cursor
 * remains untouched.
 * @callback ExpectCallback
 * @param {String} key - Regular expression to expect.
 * @param {String} errName - Name to refer to the regular expression by should
 *                           the expected regex not be found.
 * @return {Result} Ok value is the matched string, Err is the error described
 *                  using the errName.
 **/

/**
 * Matches a regex against the next non-whitespace characters in the source
 * code. If a match is found then an error is returned using the regex's
 * name, otherwise an Ok is returned with no value.
 * In either case, the cursor remains unmodified.
 * @callback ExpectNotCallback
 * @param {String} key - Regular expression to match against.
 * @param {String} errName - Name to refer to the regular expression by should
 *                           the expected regex not be found.
 * @return {Result} Ok value is empty, Err is the error described using the
 *                  errName.
 **/

/**
 * Generates an error message which displays the current line and cursor
 * location with the error string beneath.
 * @callback errAtCursor
 * @param {String} err - The error string to be displayed.
 * @return {String} The complete error message.
 **/

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
  var whitespaceMatcher = /(\s+)/;
  var cleanSource = stripComments(rawSource);

  return {
    src        : cleanSource,
    cursor     : 0,
    lineStart  : 0,
    line       : 1,
    parenCtr   : 0,
    insideGene : 0,

    peek : function() {
      return this.src[this.cursor];
    },

    next : function() {
      this.eatWhitespace();

      return this.peek();
    },

    expect : function(key, errName) {
      this.eatWhitespace();

      var slice = this.src.slice(this.cursor);
      var results = slice.match(key);
      if (!results || results.index !== 0) {
        return Err(
          this.errAtCursor("Expected to find " + (errName || key.toString()))
        );
      }

      this.cursor += results[0].length;

      return Ok( results[0] );
    },

    expectNot : function(key, errName) {
      this.eatWhitespace();

      var slice = this.src.slice(this.cursor);
      var results = slice.match(key);
      if (results && results.index === 0) {
        return Err( this.errAtCursor("Unexpected " + errName) );
      }

      return Ok();
    },

    eatWhitespace : function() {
      var currentSlice = this.src.slice(this.cursor);

      var results = currentSlice.match(whitespaceMatcher);
      if (results && results.index === 0) {
        var newLineDesc = processNewline(results[0]);

        this.line += newLineDesc.lineCount;
        if (newLineDesc.lineCount > 0) {
          this.lineStart = this.cursor + newLineDesc.indexOfLastLine;
        }

        this.cursor += results[0].length;
      }
    },

    errAtCursor : function(err) {
      var nextNewLine = this.src.length;
      var results = this.src.slice(this.cursor).match(/[\n\r]/);
      if (results) {
        nextNewLine = this.cursor + results.index;
      }

      var line = this.src.slice(this.lineStart, nextNewLine) + "\n";
      var errLen = this.cursor - this.lineStart;
      var errDesc = "Error on line " + this.line + " : " + (errLen + 1) + "\n";

      return errDesc + line + (new Array(errLen)).join(' ') + '^\n' + err;
    }
  };
};













