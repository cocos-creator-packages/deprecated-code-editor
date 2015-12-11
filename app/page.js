var Editor = require('../panel/editor.js');

// add our own builtins
require('../panel/firedoc-helper.js').generateBuiltin();

var editor = new Editor();