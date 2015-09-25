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
 * Creates a new SourceManager instance.
 * The SourceManager helps with parsing source code by keeping track of how far
 * through the code we have parsed (using the cursor) and what line we are
 * currently on. Helper methods are provided for skipping whitespace, and
 * matching keywords.
 **/
module.exports = function(rawSource) {
  var whitespaceMatcher = /(\s+)/;

  return {
    src       : rawSource,  // Source code, represented as a single string
    cursor    : 0,          // Current location in the code, used by the parser
    lineStart : 0,          // Cursor location where the current line started
    line      : 1,          // Current line-count

    /**
     * Peek at the current character.
     * @return the character under the cursor, does not modify the source or cursor.
     **/
    peek : function() {
      return this.src[this.cursor];
    },

    /**
     * Skips whitespace until reaching a non-whitespace character,
     * then returns that character.
     * @return {String} The next non-whitespace character.
     **/
    next : function() {
      this.eatWhitespace();

      return this.peek();
    },

    /**
     * Reads all of the whitespace after the cursor and increments the
     * cursor to point to the next non-whitespace character. Records
     * newlines as they are passed, incrementing the line counter.
     **/
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

    /**
     * Returns a string with the current line's text and a carrot under
     * the location of the cursor. Assumes that the string will be displayed
     * with a monospace font.
     * The error string is displayed below the carrot.
     * @param {String} err - The error string to display below the carrot.
     * @return {String} Current line and carrot.
     **/
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













