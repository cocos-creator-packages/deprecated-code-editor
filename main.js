
var win;

module.exports = {
    load: function () {},

    unload: function () {},

    'code-editor:open-by-uuid': function ( uuid ) {

        win = new Editor.Window('code-editor', {
            'title': 'Fireball - Code Editor',
            'width': 960,
            'height': 720,
            'min-width': 300,
            'min-height': 300,
            'show': true,
            'resizable': true,
        });
        Editor.MainMenu.add('File/Save', {
            'message': 'code-editor:save'
        });
        win.nativeWin.on('closed', function () {
            Editor.MainMenu.remove('File/Save');
        });
        win.load( 'packages://code-editor/panel/index.html', {path: Editor.assetdb.uuidToFspath(uuid)} );
    },

    'code-editor:save': function () {
        win.nativeWin.webContents.send('file.save');
    },

    'code-editor:open-by-path': function ( path ) {
        var win = new Editor.Window('code-editor', {
            'title': 'Fireball - Canvas Studio',
            'width': 1280,
            'height': 720,
            'min-width': 100,
            'min-height': 100,
            'show': false,
            'resizable': true,
        });
        win.load( 'packages://code-editor/panel/' + ace, {path: path} );
    },

    'code-editor:ace-kitchen': function () {
        var win = new Editor.Window('code-editor', {
            'title': 'Fireball - Code Editor',
            'width': 960,
            'height': 720,
            'min-width': 300,
            'min-height': 300,
            'show': true,
            'resizable': true,
        });
        win.load( 'packages://code-editor/ace-1.1.9/kitchen-sink.html');
    },

    'code-editor:cm-kitchen': function () {
        var win = new Editor.Window('code-editor', {
            'title': 'Fireball - Code Editor',
            'width': 960,
            'height': 720,
            'min-width': 300,
            'min-height': 300,
            'show': true,
            'resizable': true,
        });
        win.load( 'packages://code-editor/codemirror-5.4/index.html');
    },
};
