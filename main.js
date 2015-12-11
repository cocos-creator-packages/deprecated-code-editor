/* global __dirname */
/* global Editor */

module.exports = {
    load: function () {
    },

    unload: function () {
        Editor.Panel.close('code-editor.panel');
    },

    'code-editor:open-by-uuid': function( uuid ) {

        var editorWin = Editor.Panel.findWindow('code-editor.panel');

        Editor.Panel.open('code-editor.panel', {
            url: Editor.assetdb.uuidToUrl( uuid ),
            path: Editor.assetdb.uuidToFspath( uuid ),
        });

        // first time open the code editor
        if ( !editorWin ) {
            editorWin = Editor.Panel.findWindow('code-editor.panel');
        }
    },
};
