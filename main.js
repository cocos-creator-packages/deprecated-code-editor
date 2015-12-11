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
            editorWin.nativeWin.webContents.on( 'did-finish-load', function() {
                Editor.info('TODO - build doc');
                // doc.build( function ( err, ast, opt ) {
                //    editorWin.sendToPage( 'code-editor:ast', ast );
                // });
            });
        }
    },

    'code-editor:save': function() {
        // win.nativeWin.webContents.send( 'code-editor:save-from-page' );
        Editor.Panel.sendToPanel( 'code-editor.panel', 'code-editor:save-from-page' );
    },

    // 'code-editor:open-by-path': function( path ) {
    //     var win = new Editor.Window( 'code-editor', {
    //         'title': 'Fireball - Canvas Studio',
    //         'width': 1280,
    //         'height': 720,
    //         'min-width': 100,
    //         'min-height': 100,
    //         'show': false,
    //         'resizable': true,
    //     } );
    //     win.load( 'packages://code-editor/panel/index.html', {
    //         path: path
    //     } );
    // },
};
