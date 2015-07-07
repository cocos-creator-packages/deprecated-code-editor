(function () {
var Fs = require('fire-fs');

Editor.registerPanel( 'code-editor.panel', {
    is: 'code-editor',

    properties: {
    },

    ready: function () {
    },

    attached: function () {
        // TODO: this.profiles.global
        this.codeMirror = CodeMirror(this.$.view, {
            mode: 'javascript',
            theme: this.profiles.global.theme,
            tabSize: this.profiles.global.tabSize,
            keyMap: this.profiles.global.keyMap,
            lineNumbers: this.profiles.global.lineNumbers,
        });
    },

    'panel:open': function ( argv ) {
        if ( !argv )
            return;

        if ( argv.uuid ) {
            Editor.assetdb.queryPathByUuid( argv.uuid, function ( path ) {
                this.load(path);
            }.bind(this));
            return;
        }

        if ( argv.path ) {
            this.load(argv.path);
            return;
        }
    },

    load: function ( path ) {
        this.$.loader.hidden = false;
        Fs.readFile(path, 'utf8', function ( err, data ) {
            this.$.loader.hidden = true;
            this.codeMirror.setValue(data);
        }.bind(this));
    },
});

})();
