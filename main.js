'use strict';

module.exports = {
  load () {
  },

  unload () {
    Editor.Panel.close('code-editor.panel');
  },

  'code-editor:open-by-uuid' ( uuid ) {
    let url = Editor.assetdb.uuidToUrl( uuid );
    let path = Editor.assetdb.uuidToFspath( uuid );

    Editor.Panel.open('code-editor.panel', {
      url: url,
      path: path
    });

    // first time open the code editor
    let editorWin = Editor.Panel.findWindow('code-editor.panel');
    editorWin.nativeWin.setTitle(
      `Code Editor - ${url}`
    );
  },
};
