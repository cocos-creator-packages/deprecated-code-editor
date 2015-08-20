/* global CodeMirror */
/* global Editor */
var Fs = require('fire-fs');
var Ipc = require('ipc');
var Intellisense = require('firedoc-intellisense');

document.addEventListener('DOMContentLoaded', function(event) {
  var url = Editor.argv.url;
  var path = Editor.argv.path;
  var editor = CodeMirror(document.body, {
    'mode': 'javascript',
    'theme': 'material',
    'tabSize': 2,
    'keyMap': 'sublime',
    'lineNumbers': true,
    'fontFamily': 'DejaVu Sans Mono',
    'autoCloseBrackets': true,
    'matchBrackets': true,
    'autoComplete': true,
    'showCursorWhenSelecting': true,
    'value': '',
    'extraKeys': function (context) {
      var key = this + '';
      var cur = editor.getCursor();
      var tok = editor.getTokenAt(cur);
      if (key === 'Cmd-S' || key === 'Ctrl-S') {
        onSave(context);
        return;
      }
      // show the autocomplete only if the cursor is in the end of this line.
      // this line fixes #4: https://github.com/fireball-packages/code-editor/issues/4
      var line = editor.getLine(cur.line);
      if (line.length > cur.ch) return;
      
      // if line.length > cursor, start to handle with autocomplete
      switch (tok.type) {
      case 'string':
      case 'comment':
      case 'keyword':
      case 'number': break;
      default:
        if (/^(var|function)$/.test(tok.state.lastType)) break;
        if (/'[0-9]{1}'/.test(key) && tok.state.lastType === 'operator') break;
        if (/'[a-z0-9\.\(]{1}'/i.test(key)) {
          editor.replaceRange(key[1], cur, {
            'line': cur.line,
            'xRel': cur.xRel,
            'ch'  : cur.ch + 1
          });
          return 'autocomplete';
        }
      }
    }
  });

  Fs.readFile(path, function (err, buf) {
    editor.setValue(buf.toString('utf8'));
  });

  function onSave (context) {
    Editor.sendToCore('asset-db:save', url, context.getValue());
  }

  Ipc.on('code-editor:ast', function (ast) {
    editor.intellisense = Intellisense(ast);
  });

  Ipc.on('code-editor:save-from-page', function () {
    onSave(editor);
  });

});
