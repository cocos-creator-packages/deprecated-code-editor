# code-editor

Fireball builtin text editor

## Research Helper

For now we are not decided yet which JavaScript code editor to use, so I added both [Ace](http://ace.c9.io/) and [Code Mirror](http://codemirror.net/) into this package.

To switch default text editor when double click script file in Fireball, edit [main.js](main.js) and change the following part:

```js
win.load( 'packages://code-editor/panel/' + ace, {path: path} );
```

To append `ace` or `codemirror` at the end of the window url.

### Demos

You can use the editor menu:

- Developer/Code Editor/Ace Kitchen
- Developer/Code Editor/CodeMirror Kitchen

to open the demo page of both text editor.
