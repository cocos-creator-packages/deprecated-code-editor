(() => {
  'use strict';

  /* global Editor */
  const Fs = require('fire-fs');
  const Ipc = require('ipc');
  const CodeEditor = require('./editor.js');

  const enginePath = Editor.url( 'app://utils/api/engine' );
  const editorPath = Editor.url( 'app://utils/api/editor-framework' );
  const assetdbPath = Editor.url( 'app://utils/api/asset-db');

  require('./firedoc-helper.js').generateBuiltin(enginePath, editorPath, assetdbPath);

  document.addEventListener('DOMContentLoaded', () => {
    let url = Editor.argv.url;
    let path = Editor.argv.path;

    let editor = new CodeEditor(path, url);

    Fs.readFile(path, (err, buf) => {
      editor.aceEditor.setValue(buf.toString('utf8'), -1);
    });

    Ipc.on('panel:run', argv => {
      // let url = argv.url;
      let path = argv.path;

      Fs.readFile(path, (err, buf) => {
        editor.aceEditor.setValue(buf.toString('utf8'), -1);
      });
    });

  });
})();
