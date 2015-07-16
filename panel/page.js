
var Fs = require('fire-fs');
var Ipc = require('ipc');

document.addEventListener("DOMContentLoaded", function(event) {
  var url = Editor.argv.url;
  var path = Editor.argv.path;
  var text = Fs.readFileSync(path, 'utf8');
  var editor = CodeMirror(document.body, {
    mode: 'javascript',
    theme: "zenburn",
    tabSize: 2,
    keyMap: "sublime",
    lineNumbers: true,
    fontFamily: "DejaVu Sans Mono",
    autoComplete: true,
    value: text,
    extraKeys: {
      'Ctrl-S': onSave,
      'Cmd-S': onSave
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
