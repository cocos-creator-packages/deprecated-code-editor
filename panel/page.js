document.addEventListener("DOMContentLoaded", function(event) {
  //do work
  var fs = require('fire-fs');
  var text = fs.readFileSync(Editor.argv.path, 'utf8');

  var codeMirror = CodeMirror(document.body, {
      mode: 'javascript',
      theme: "zenburn",
      tabSize: 2,
      keyMap: "sublime",
      lineNumbers: true,
      fontFamily: "DejaVu Sans Mono",
      autoComplete: true,
      value: text
  });

});
