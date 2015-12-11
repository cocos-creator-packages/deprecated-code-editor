/* global CodeMirror */
/* global Editor */
var fs = require('fire-fs');
var ipc = require('ipc');
var CodeEditor = require('./editor.js');

require('./firedoc-helper.js').generateBuiltin();

document.addEventListener('DOMContentLoaded', function(event) {
  var url = Editor.argv.url;
  var path = Editor.argv.path;

  var editor = new CodeEditor(path, url);

  fs.readFile(path, function (err, buf) {
    editor.aceEditor.setValue(buf.toString('utf8'), -1);
  });

  function onSave (context) {
    Editor.sendToCore('asset-db:save', url, context.aceEditor.getValue());
  }

  ipc.on('panel:open', function (argv) {
    var url = argv.url;
    var path = argv.path;
    fs.readFile(path, function (err, buf) {
      editor.aceEditor.setValue(buf.toString('utf8'), -1);
    });
  });

  // ipc.on('code-editor:ast', function (ast) {
  //   editor.intellisense = Intellisense(ast);
  // });

  ipc.on('code-editor:save-from-page', function () {
    onSave(editor);
  });

});
