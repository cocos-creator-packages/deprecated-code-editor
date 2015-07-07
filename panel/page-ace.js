document.addEventListener("DOMContentLoaded", function(event) {
  //do work
  var fs = require('fire-fs');
  var text = fs.readFileSync(Editor.argv.path, 'utf8');

  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/javascript");
  editor.setValue(text);
});
