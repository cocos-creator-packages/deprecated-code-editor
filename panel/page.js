
var Fs = require('fire-fs');
var Ipc = require('ipc');

document.addEventListener("DOMContentLoaded", function(event) {
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
      'Ctrl-S': onsave
    }
  });

  function onsave (context) {
    Fs.writeFile(path, context.getValue(), 'utf8');
  }

  Ipc.on('file.save', function () {
    onsave(editor);
  });

});
