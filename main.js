module.exports = {
    load: function () {
    },

    unload: function () {
    },

    'code-editor:open-by-uuid': function ( uuid ) {
        Editor.Panel.open('code-editor.panel', { uuid: uuid } );
    },

    'code-editor:open-by-path': function ( path ) {
        Editor.Panel.open('code-editor.panel', { path: path } );
    },
};
