'use strict';

const LangTools = window.ace.require('ace/ext/language_tools');
const CodeHelper = require('./helper.js');
const EsprimaHelper = require('./esprima-helper.js');

let esprimaHelper;

let fireballCompleter = {
  getCompletions (editor, session, pos, prefix, callback) {

    // use esprima to parse the file and return completions
    function computeCompletions(editor, session, pos, prefix) {
      let offset = session.getDocument().positionToIndex(pos);
      let proposals = esprimaHelper.computeCompletions(session.getValue(), offset, prefix);
      return proposals;
    }

    // if the pop up window is triggered by `.`, such as foo., then should disable other keyWordCompleters,
    // because we know it wants to access attributes now
    if (prefix === '')
      CodeHelper.disableSystemCompleters(editor);
    else
      CodeHelper.enableSystemCompleters(editor);

    let completions = [];
    let proposals = computeCompletions(editor, session, pos, prefix);
    for (let i in proposals) {
      let proposal = proposals[i];
      completions.push({
        value: prefix + proposal.proposal,
        description: proposal.description
      });
    }

    callback(null, completions);
  },

  getDocTooltip (selected) {
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
  editor.setTheme('ace/theme/tomorrow_night_eighties');
  // editor.setTheme('ace/theme/monokai');
  editor.getSession().setMode('ace/mode/javascript');
  editor.$blockScrolling = Infinity;
  editor.completers = [fireballCompleter, LangTools.keyWordCompleter, LangTools.snippetCompleter, LangTools.textCompleter];
}

// @path the file path to open
// @url the url to open
class CodeEditor {
  constructor ( path, url, uuid ) {
    this._url = url;
    this._path = path;
    this._uuid = uuid;

    this.aceEditor = window.ace.edit('editor');
    initEditor(this.aceEditor);

    // init esprimar
    esprimaHelper = new EsprimaHelper(path);

    let self = this;

    // handle save operation
    this.aceEditor.commands.addCommand({
      name: 'save content',
      readOnly: false,
      bindKey: {
        win: 'Ctrl-S',
        mac: 'Command-S'
      },

      exec () {
        self.save();
      },
    });

    this.aceEditor.getSession().on('change', () => {
      setTimeout(() => {
        var dirty = !this.aceEditor.getSession().getUndoManager().isClean();
        Editor.sendToCore('code-editor:update-title', self._url, dirty);
      },1);
    });
  }

  save () {
    let text = this.aceEditor.getValue();
    Editor.sendToCore('asset-db:save', this._url, text);

    // TODO: we should use asset-db:asset-changed instead
    this.aceEditor.getSession().getUndoManager().markClean();
    Editor.sendToCore('code-editor:update-title', this._url, false);
  }
}

module.exports = CodeEditor;
