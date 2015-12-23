(() => {
  'use strict';

  /* global Editor */
  const Fs = require('fire-fs');
  const Path = require('fire-path');
  const Ipc = require('ipc');
  const CodeEditor = require('./editor.js');

  const enginePath = Editor.url( 'app://utils/api/engine' );
  const editorPath = Editor.url( 'app://utils/api/editor-framework' );
  const assetdbPath = Editor.url( 'app://utils/api/asset-db');

  require('./firedoc-helper.js').generateBuiltin(enginePath, editorPath, assetdbPath);

  let codeEditor = null;
  let editUrl = '';
  let editPath = '';

  function _confirmClose () {
    var dirty = !codeEditor.aceEditor.getSession().getUndoManager().isClean();
    if ( dirty ) {
      let name = Path.basename(editPath);

      return Editor.Dialog.messageBox({
        type: 'warning',
        buttons: ['Save','Cancel','Don\'t Save'],
        title: 'Save Script Confirm',
        message: `${name} has changed, do you want to save it?`,
        detail: 'Your changes will be lost if you close this item without saving.'
      });
    }

    //
    return 2;
  }

  Ipc.on('panel:run', argv => {
    editUrl = argv.url;
    editPath = argv.path;

    Fs.readFile(editPath, (err, buf) => {
      // NOTE: https://github.com/ajaxorg/ace/issues/1243
      codeEditor.aceEditor.getSession().setValue(buf.toString('utf8'), -1);
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    editUrl = Editor.argv.url;
    editPath = Editor.argv.path;

    codeEditor = new CodeEditor(editPath, editUrl);

    Fs.readFile(editPath, (err, buf) => {
      // NOTE: https://github.com/ajaxorg/ace/issues/1243
      codeEditor.aceEditor.getSession().setValue(buf.toString('utf8'), -1);
    });
  });

  // beforeunload event
  window.addEventListener('beforeunload', event => {
    let res = _confirmClose();
    switch ( res ) {
      // save
      case 0:
      codeEditor.save();
      event.returnValue = true;
      return;

      // cancel
      case 1:
      event.returnValue = false;
      return;

      // don't save
      case 2:
      event.returnValue = true;
      return;
    }
  });
})();
