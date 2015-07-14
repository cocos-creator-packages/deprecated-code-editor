document.addEventListener("DOMContentLoaded", function(event) {
  var fs = require('fire-fs');
  var text = fs.readFileSync(Editor.argv.path, 'utf8');
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
    fs.writeFile(Editor.argv.path, context.getValue(), 'utf8');
  }

});
