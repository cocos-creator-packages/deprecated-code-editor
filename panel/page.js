/* global CodeMirror */
/* global Editor */
var Fs = require('fire-fs');
var Ipc = require('ipc');
var CodeEditor = require('./editor.js');
var enginePath = Editor.url( 'app://utils/api/engine' );
var editorPath = Editor.url( 'app://utils/api/editor-framework' );
var assetdbPath = Editor.url( 'app://utils/api/asset-db');
var runtimePath = Editor.runtimePath;

require('./firedoc-helper.js').generateBuiltin(enginePath, editorPath, assetdbPath);

document.addEventListener('DOMContentLoaded', function(event) {
  var url = Editor.argv.url;
  var path = Editor.argv.path;

  var editor = new CodeEditor(path, url);

  Fs.readFile(path, function (err, buf) {
    editor.aceEditor.setValue(buf.toString('utf8'), -1);
  });

  function onSave (context) {
    Editor.sendToCore('asset-db:save', url, context.aceEditor.getValue());
  }

  Ipc.on('panel:open', function (argv) {
    var url = argv.url;
    var path = argv.path;
    Fs.readFile(path, function (err, buf) {
      editor.aceEditor.setValue(buf.toString('utf8'), -1);
    });
  });

  // ipc.on('code-editor:ast', function (ast) {
  //   editor.intellisense = Intellisense(ast);
  // });

  Ipc.on('code-editor:save-from-page', function () {
    onSave(editor);
  });

});
