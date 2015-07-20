var Fs = require('fire-fs');
var Ipc = require('ipc');

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
    'autoComplete': true,
    'showCursorWhenSelecting': true,
    'value': text,
    'extraKeys': function (context) {
      var key = this + '';
      if (key === 'Cmd-S' || key === 'Ctrl-S') {
        onSave(context);
      } else if (/'[a-z0-9]{1}'/i.test(key)) {
        // disable autocomplete
        // return 'autocomplete';
      }
    }
  });

  function onSave (context) {
    // Fs.writeFile(path, context.getValue(), 'utf8');
    Editor.sendToCore( 'asset-db:save', url, context.getValue() );
  }

  Ipc.on('code-editor:save-from-page', function () {
    onSave(editor);
  });

});
