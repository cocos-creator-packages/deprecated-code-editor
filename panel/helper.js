var fs = require('fs');
var path = require('path');
var langTools = ace.require('ace/ext/language_tools');

function disableCompleter(editor, completer) {
  for (var i in editor.completers) {
    var value = editor.completers[i];
    if (value === completer) {
      editor.completers.splice(i, 1);
      return;
    }
   }
}

function enableCompleter(editor, completer) {
  for (var i in editor.completers) {
    var value = editor.completers[i];
    if (value === completer)
        return;
  }
  editor.completers.push(completer); 
}

function enalbeKeyWordCompleter() {
  enableCompleter(langTools.keyWordCompleter);
}

function disableKeyWordCompleter() {
   disableCompleter(langTools.keyWordCompleter);
}

function disableSnippetCompleter() {
  disableCompleter(langTools.snippetCompleter);
}

function enableSnippetCompleter() {
  enableCompleter(langTools.sinppetCompleter);
}

function findFileInDirectory(directory, fileName) {
  var files = fs.readdirSync(directory);
  for (var i in files) {
    var file = path.join(directory, files[i]);
    var stat = fs.statSync(file);
    if (stat.isFile() && (files[i] === fileName))
        return file;

    if (stat.isDirectory()) {
      var newDirectory = path.join(directory, files[i]);
      var ret = findFileInDirectory(newDirectory, fileName);
      if (ret)
        return ret;
    }
  }

  // can not find the file
  return null;
}

// root directory of user project, it will use fireball core level to get the value when integrating with fireball
exports.rootDir = __dirname;

// root directory of editor
exports.editorRoot = __dirname;

// find js file with the file name in root directory
// in fireball, file name is unique through the project
exports.findFile = function(fileName) {
  return findFileInDirectory(exports.rootDir, fileName);
}

// enable keyWordCompleter and snippetCompleter
exports.enableSystemCompleters = function(editor) {
  enableCompleter(editor, langTools.keyWordCompleter);
  enableCompleter(editor, langTools.snippetCompleter);
}

// disable keyWordCompleter and sinppetCompleter
exports.disableSystemCompleters = function(editor) {
  disableCompleter(editor, langTools.keyWordCompleter);
  disableCompleter(editor, langTools.snippetCompleter);
}
