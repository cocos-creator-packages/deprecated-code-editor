/* global __dirname */
/* global Editor */

var win;
var Util = require( 'util' );
var Path = require( 'path' );
var Firedoc = require( 'firedoc' ).Firedoc;
var enginePath = Editor.url( 'app://utils/api/engine-framework' );
var editorPath = Editor.url( 'app://utils/api/editor-framework' );
var runtimePath = Editor.runtimePath;
var doc;

module.exports = {
    load: function () {
        doc = new Firedoc( {
            cwd: enginePath,
            paths: [
                enginePath,
                editorPath,
                Editor.projectPath
            ],
            parseOnly: true
        } );
        console.log(Editor.appPath);
    },

    unload: function () {
        if ( win && typeof win.close === 'function' ) {
            win.close();
        }
        win = null;
    },

    'code-editor:open-by-uuid': function( uuid ) {
        if ( !win || !win.focus ) {
            win = new Editor.Window( 'code-editor', {
                'title': 'Fireball - Code Editor',
                'width': 960,
                'height': 720,
                'min-width': 300,
                'min-height': 300,
                'show': true,
                'resizable': true,
            } );
            Editor.MainMenu.add( 'File/Save', {
                'message': 'code-editor:save'
            } );
            win.nativeWin.on( 'closed', function() {
                Editor.MainMenu.remove('File/Save');
                win = null;
            } );
            win.nativeWin.webContents.on( 'did-finish-load', function() {
                doc.build( function ( err, ast, opt ) {
                    win.nativeWin.webContents.send( 'code-editor:ast', ast );
                } );
            } );
        } else {
            win.focus();
        }
        win.load( 'packages://code-editor/panel/index.html', {
            url: Editor.assetdb.uuidToUrl( uuid ),
            path: Editor.assetdb.uuidToFspath( uuid ),
        } );
    },

    'code-editor:save': function() {
        win.nativeWin.webContents.send( 'code-editor:save-from-page' );
    },

    'code-editor:open-by-path': function( path ) {
        var win = new Editor.Window( 'code-editor', {
            'title': 'Fireball - Canvas Studio',
            'width': 1280,
            'height': 720,
            'min-width': 100,
            'min-height': 100,
            'show': false,
            'resizable': true,
        } );
        win.load( 'packages://code-editor/panel/index.html', {
            path: path
        } );
    },
};
