(() => {
  'use strict';

  /* global Editor */
  const Fs = require('fire-fs');
  const Path = require('fire-path');
  const Ipc = require('ipc');
  const CodeEditor = require('./editor.js');

  const enginePath = Editor.url('app://utils/api/engine');
  const editorPath = Editor.url('app://utils/api/editor-framework');
  const assetdbPath = Editor.url('app://utils/api/asset-db');

  require('./firedoc-helper.js').generateBuiltin(enginePath, editorPath, assetdbPath);

  let codeEditor = null;

  function _confirmClose () {
    var dirty = !codeEditor.aceEditor.getSession().getUndoManager().isClean();
    if ( dirty ) {
      let name = Path.basename(codeEditor._path);

      return Editor.Dialog.messageBox({
        type: 'warning',
        buttons: [Editor.T('MESSAGE.save'), Editor.T('MESSAGE.cancel'), Editor.T('MESSAGE.dont_save')],
        title: Editor.T('MESSAGE.code_editor.save_confirm_title'),
        message: Editor.T('MESSAGE.code_editor.save_confirm_message', {name: name}),
        detail: Editor.T('MESSAGE.code_editor.save_confirm_detail')
      });
    }

    //
    return 2;
  }

  function _confirmReload () {
    var dirty = !codeEditor.aceEditor.getSession().getUndoManager().isClean();
    if ( dirty ) {
      let name = Path.basename(codeEditor._path);

      return Editor.Dialog.messageBox({
        type: 'warning',
        buttons: ['Load','Cancel'],
        title: 'Script changed outside',
        message: `${name} has changed in other place, do you want to load the changes?`,
        detail: 'Your changes will be lost if you load it.'
      });
    }

    // nothing changed, load it anyway
    return 0;
  }

  function _openFile ( argv, row, column ) {
    codeEditor._url = argv.url;
    codeEditor._path = argv.path;
    codeEditor._uuid = argv.uuid;

    Fs.readFile(argv.path, (err, buf) => {
      // NOTE: https://github.com/ajaxorg/ace/issues/1243
      codeEditor.aceEditor.getSession().setValue(buf.toString('utf8'), -1);

      if ( row !== undefined && column !== undefined ) {
        codeEditor.aceEditor.moveCursorTo( row, column );
      }
    });
  }

  Ipc.on('panel:run', argv => {
    let res = _confirmClose();
    switch ( res ) {
      // save
      case 0:
      codeEditor.save();
      _openFile(argv);
      return;

      // cancel
      case 1:
      return;

      // don't save
      case 2:
      _openFile(argv);
      return;
    }
  });

  Ipc.on('asset-db:asset-changed', function ( result ) {
    if ( codeEditor._uuid !== result.uuid ) {
      return;
    }

    let cursor = codeEditor.aceEditor.getCursorPosition();
    let res = _confirmReload();
    switch (res) {
      // reload
      case 0:
      _openFile({
        url: codeEditor._url,
        path: codeEditor._path,
        uuid: codeEditor._uuid,
      }, cursor.row, cursor.column);
      return;

      // cancel
      case 1:
      return;
    }
  });

  Ipc.on('asset-db:assets-moved', function ( results ) {
    results.forEach(result => {
      if ( codeEditor._uuid !== result.uuid ) {
        return;
      }

      codeEditor._uuid = result.uuid;
      codeEditor._url = result.url;
      codeEditor._path = result.destPath;

      let dirty = !codeEditor.aceEditor.getSession().getUndoManager().isClean();
      Editor.sendToCore('code-editor:update-title', codeEditor._url, dirty);
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    codeEditor = new CodeEditor(
      Editor.argv.path,
      Editor.argv.url,
      Editor.argv.uuid
    );
    _openFile(Editor.argv);
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
