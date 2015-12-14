'use strict';

const LangTools = ace.require('ace/ext/language_tools');
const Helper = require('./helper.js');
const EsprimaHelper = require('./esprima-helper.js');

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
      Helper.disableSystemCompleters(editor);
    else
      Helper.enableSystemCompleters(editor);

    var completions = [];
    var proposals = computeCompletions(editor, session, pos, prefix);
    for (var i in proposals) {
      var proposal = proposals[i];
      completions.push({
        value: prefix + proposal.proposal,
        description: proposal.description
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
  editor.completers = [fireballCompleter, LangTools.keyWordCompleter, LangTools.snippetCompleter, LangTools.textCompleter];
}

// @path the file path to open
// @url the url to open
var CodeEditor = function(path, url) {
  this.aceEditor = ace.edit('editor');
  initEditor(this.aceEditor);

  // handle save operation
  this.aceEditor.commands.addCommand({
    name: 'save content',
    bindKey: { win: 'Ctrl-S',
               mac: 'Command-S' },
    exec: function(editor) {
      Editor.sendToCore('asset-db:save', url, editor.getValue());
    },
    readOnly: false
  });

  // init esprimar
  esprimaHelper = new EsprimaHelper(path);
}

CodeEditor.prototype.constructor = CodeEditor;

module.exports = CodeEditor;
