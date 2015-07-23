var Fs = require('fire-fs');
var Ipc = require('ipc');
var Path = require('path');
var Firedoc = require('firedoc-api').Firedoc;
var Intellisense = function (ast) {
  var nsMap = ast.namespacesMap;
  var classesKeys = Object.keys(ast.classes);
  var modulesKeys = Object.keys(ast.modules);
  var ret = classesKeys.concat(modulesKeys);
  ast.members.forEach(function (member) {
    var parent = member.parent || ast.modules[member.module];
    if (!parent.members || parent.members.length === 0) {
      parent.members = {};
    }
    // console.log(member);
    if (member.itemtype === 'method') {
      parent.members[member.name] = function () {};
    } else if (member.itemtype === 'property') {
      try {
        var type = member.type.replace(/[\{\}]/g, '').split('.').pop();
        var isArray = /\[\]$/.test(type);
        if (isArray) {
          parent.members[member.name] = 'Array';
        } else {
          parent.members[member.name] = type;
        }
      } catch (e) {}
    }
  });
  ret.get = function (name) {
    return ast.classes[name] || ast.modules[name];
  };
  return ret;
};

document.addEventListener('DOMContentLoaded', function(event) {
  var url = Editor.argv.url;
  var path = Editor.argv.path;
  var text = Fs.readFileSync(path, 'utf8');
  var enginePath = Path.join(__dirname, '../../engine-framework/src');
  var doc = new Firedoc({
    path: enginePath,
    parseOnly: true
  });
  var editor = CodeMirror(document.body, {
    'mode': 'javascript',
    'theme': 'material',
    'tabSize': 2,
    'keyMap': 'sublime',
    'lineNumbers': true,
    'fontFamily': 'DejaVu Sans Mono',
    'autoCloseBrackets': true,
    'matchBrackets': true,
    'autoComplete': true,
    'showCursorWhenSelecting': true,
    'value': text,
    'extraKeys': function (context) {
      var key = this + '';
      var cur = editor.getCursor();
      var tok = editor.getTokenAt(cur);
      if (key === 'Cmd-S' || key === 'Ctrl-S') {
        onSave(context);
        return;
      }
      switch (tok.type) {
      case 'string':
      case 'comment':
      case 'keyword':
      case 'number': break;
      default:
        if (/^(var|function)$/.test(tok.state.lastType)) break;
        if (/'[0-9]{1}'/.test(key) && tok.state.lastType === 'operator') break;
        if (/'[a-z0-9\.]{1}'/i.test(key)) {
          editor.replaceRange(key[1], cur, {
            'line': cur.line,
            'xRel': cur.xRel,
            'ch'  : cur.ch + 1
          });
          return 'autocomplete';
        }
      }
    }
  });

  doc.build(function (err, ast, opt) {
    editor.intellisense = Intellisense(ast);
  });

  function onSave (context) {
    // Fs.writeFile(path, context.getValue(), 'utf8');
    Editor.sendToCore( 'asset-db:save', url, context.getValue() );
  }

  Ipc.on('code-editor:save-from-page', function () {
    onSave(editor);
  });

});
