var path = require('path');
var fs = require('fs');

var langTools = ace.require('ace/ext/language_tools');
var helper = require('./helper.js');
var EsprimaHelper = require('./esprima-helper.js');

var esprimaHelper;

var fireballCompleter = {
  getCompletions: function(editor, session, pos, prefix, callback) {

    // use esprima to parse the file and return completions
    function computeCompletions(editor, session, pos, prefix) {
      var offset = session.getDocument().positionToIndex(pos);
      var proposals = esprimaHelper.computeCompletions(session.getValue(), offset, prefix);
      return proposals;
    }

    // if the pop up window is triggered by `.`, such as foo., then should disable other keyWordCompleters,
    // because we know it wants to access attributes now
    if (prefix === '')
      helper.disableSystemCompleters(editor);
    else
      helper.enableSystemCompleters(editor);

    var completions = [];
    var proposals = computeCompletions(editor, session, pos, prefix);
    for (var i in proposals) {
      var proposal = proposals[i];
      completions.push({
        value: prefix + proposal.proposal,
        description: proposal.description,
      });
    }

    callback(null, completions);
  },

  getDocTooltip: function(selected) {
    return selected.description;
  },

  // add this line to make foo. can trigger the pop-up window
  identifierRegexps: [ /[a-zA-Z_0-9\$\-\u00A2-\uFFFF.]/ ]
};

function initEditor(editor) {
  editor.setOptions({
    enableLiveAutocompletion: true,
    enableSnippets: true,
  });
  editor.setTheme('ace/theme/monokai');
  editor.getSession().setMode('ace/mode/javascript');
  editor.$blockScrolling = Infinity;
  editor.completers = [fireballCompleter, langTools.keyWordCompleter, langTools.snippetCompleter];
}

// @path the file path to open
// @url the url to open
var Editor = function(path, url) {
  this.openByFireball = (path != undefined);
  this.path = path || 'unknown.js';
  this.aceEditor = ace.edit('editor');
  initEditor(this.aceEditor);

  // init esprimar
  esprimaHelper = new EsprimaHelper(this.path);
}

Editor.prototype.constructor = Editor;

module.exports = Editor;
