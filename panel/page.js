var Fs = require('fire-fs');
var Ipc = require('ipc');
var Intellisense = require('firedoc-intellisense');

document.addEventListener('DOMContentLoaded', function(event) {
  var url = Editor.argv.url;
  var path = Editor.argv.path;
  var text = Fs.readFileSync(path, 'utf8');
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
    'value': text,
    'extraKeys': function (context) {
      var key = this + '';
      var cur = editor.getCursor();
      var tok = editor.getTokenAt(cur);
      if (key === 'Cmd-S' || key === 'Ctrl-S') {
        onSave(context);
        return;
      }
      switch (tok.type) {
      case 'string':
      case 'comment':
      case 'keyword':
      case 'number': break;
      default:
        if (/^(var|function)$/.test(tok.state.lastType)) break;
        if (/'[0-9]{1}'/.test(key) && tok.state.lastType === 'operator') break;
        if (/'[a-z0-9\.]{1}'/i.test(key)) {
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

  function onSave (context) {
    // Fs.writeFile(path, context.getValue(), 'utf8');
    Editor.sendToCore( 'asset-db:save', url, context.getValue() );
  }

  Ipc.on('code-editor:ast', function (ast) {
    editor.intellisense = Intellisense(ast);
    console.log(editor.intellisense);
  });

  Ipc.on('code-editor:save-from-page', function () {
    onSave(editor);
  });

});
