(() => {
  'use strict';

  const Electron = require('electron');
  const ipcRenderer = Electron.ipcRenderer;

  /* global Editor */
  const Fs = require('fire-fs');
  const Path = require('fire-path');
  const CodeEditor = require('./editor.js');

  const enginePath = Editor.url('unpack://utils/api/engine');

  require('./firedoc-helper.js').generateBuiltin(enginePath);

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
        detail: Editor.T('MESSAGE.code_editor.save_confirm_detail'),
        defaultId: 0,
        cancelId: 1,
        noLink: true,
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
        detail: 'Your changes will be lost if you load it.',
        defaultId: 0,
        cancelId: 1,
        noLink: true,
      });
    }

    // nothing changed, load it anyway
    return 0;
  }

  let _extname2mode = {
    '.js': 'javascript',
    '.coffee': 'coffee',
    '.md': 'markdown',
    '.markdown': 'markdown',
    '.txt': 'text',
    '.html': 'html',
    '.xml': 'xml',
    '.css': 'css',
    '.less': 'less',
    '.scss': 'scss',
    '.stylus': 'stylus',
    '.json': 'json',
    '.yaml': 'yaml',
    '.ini': 'ini',
  };

  function _openFile ( argv, row, column ) {
    Fs.readFile(argv.path, (err, buf) => {
      // don't do anything if the text is the same.
      // this will make sure we don't break the undo stack
      let text = buf.toString('utf8');
      if ( text === codeEditor.aceEditor.getValue() ) {
        return;
      }

      codeEditor._url = argv.url;
      codeEditor._path = argv.path;
      codeEditor._uuid = argv.uuid;

      let editorSession = codeEditor.aceEditor.getSession();
      let extname = Path.extname(argv.path);
      editorSession.setMode(`ace/mode/${_extname2mode[extname]}`);

      // NOTE: https://github.com/ajaxorg/ace/issues/1243
      editorSession.setValue(text, -1);

      if ( row !== undefined && column !== undefined ) {
        codeEditor.aceEditor.moveCursorTo( row, column );
      }
    });
  }

  ipcRenderer.on('editor:panel-run', (event, panelID, argv) => {
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

  ipcRenderer.on('asset-db:asset-changed', function ( event, result ) {
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

  ipcRenderer.on('asset-db:assets-moved', function ( event, results ) {
    results.forEach(result => {
      if ( codeEditor._uuid !== result.uuid ) {
        return;
      }

      codeEditor._uuid = result.uuid;
      codeEditor._url = result.url;
      codeEditor._path = result.destPath;

      let dirty = !codeEditor.aceEditor.getSession().getUndoManager().isClean();
      Editor.Ipc.sendToMain('code-editor:update-title', codeEditor._url, dirty);
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
      return;

      // cancel
      case 1:
      event.returnValue = true;
      return;

      // don't save
      case 2:
      return;
    }
  });
})();
