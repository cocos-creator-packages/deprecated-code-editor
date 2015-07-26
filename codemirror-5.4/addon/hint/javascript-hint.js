// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  var Pos = CodeMirror.Pos;

  function forEach(arr, f) {
    for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
  }

  function arrayContains(arr, item) {
    if (!Array.prototype.indexOf) {
      var i = arr.length;
      while (i--) {
        if (arr[i] === item) {
          return true;
        }
      }
      return false;
    }
    return arr.indexOf(item) != -1;
  }

  function scriptHint(editor, keywords, getToken, options) {
    // Find the token at the cursor
    var cur = editor.getCursor(), token = getToken(editor, cur);
    if (/\b(?:string|comment)\b/.test(token.type)) return;
    token.state = CodeMirror.innerMode(editor.getMode(), token.state).state;

    // If it's not a 'word-style' token, ignore the token.
    if (!/^[\w$_]*$/.test(token.string)) {
      token = {start: cur.ch, end: cur.ch, string: "", state: token.state,
               type: token.string == "." ? "property" : null};
    } else if (token.end > cur.ch) {
      token.end = cur.ch;
      token.string = token.string.slice(0, cur.ch - token.start);
    }

    var tprop = token;
    // If it is a property, find out what it is a property of.
    while (tprop.type == "property" || tprop.type == "call") {
      tprop = getToken(editor, Pos(cur.line, tprop.start));
      if (tprop.string != "." && tprop.type == "property") return;
      tprop = getToken(editor, Pos(cur.line, tprop.start));
      if (!context) var context = [];
      context.push(tprop);
    }
    return {list: getCompletions(token, context, keywords, options, editor),
            from: Pos(cur.line, token.start),
            to: Pos(cur.line, token.end)};
  }

  function javascriptHint(editor, options) {
    return scriptHint(editor, javascriptKeywords,
                      function (e, cur) {return e.getTokenAt(cur);},
                      options);
  };
  CodeMirror.registerHelper("hint", "javascript", javascriptHint);

  function getCoffeeScriptToken(editor, cur) {
  // This getToken, it is for coffeescript, imitates the behavior of
  // getTokenAt method in javascript.js, that is, returning "property"
  // type and treat "." as indepenent token.
    var token = editor.getTokenAt(cur);
    if (cur.ch == token.start + 1 && token.string.charAt(0) == '.') {
      token.end = token.start;
      token.string = '.';
      token.type = "property";
    }
    else if (/^\.[\w$_]*$/.test(token.string)) {
      token.type = "property";
      token.start++;
      token.string = token.string.replace(/\./, '');
    }
    return token;
  }

  function coffeescriptHint(editor, options) {
    return scriptHint(editor, coffeescriptKeywords, getCoffeeScriptToken, options);
  }
  CodeMirror.registerHelper("hint", "coffeescript", coffeescriptHint);

  var stringProps = ("charAt charCodeAt indexOf lastIndexOf substring substr slice trim trimLeft trimRight " +
                     "toUpperCase toLowerCase split concat match replace search").split(" ");
  var arrayProps = ("length concat join splice push pop shift unshift slice reverse sort indexOf " +
                    "lastIndexOf every some filter forEach map reduce reduceRight ").split(" ");
  var funcProps = "prototype apply call bind".split(" ");
  var javascriptKeywords = ("break case catch continue debugger default delete do else false finally for function " +
                  "if in instanceof new null return switch throw true try typeof var void while with").split(" ");
  var coffeescriptKeywords = ("and break catch class continue delete do else extends false finally for " +
                  "if in instanceof isnt new no not null of off on or return switch then throw true try typeof until void while with yes").split(" ");

  function getCompletions(token, context, keywords, options, editor) {
    var found = [], start = token.string, global = options && options.globalScope || window;
    function maybeAdd(str) {
      var strL = str.toLowerCase();
      var startL = start.toLowerCase();
      if (strL.lastIndexOf(startL, 0) == 0 && 
        !arrayContains(found, str)) {
        found.push(str);
      }
    }
    function gatherCompletions(obj) {
      if (obj === "Boolean") {
        return;
      } else if (typeof obj == "string") {
        forEach(stringProps, maybeAdd);
      } else if (typeof obj == "function") {
        forEach(funcProps, maybeAdd);
      } else if (Array.isArray(obj)) {
        forEach(arrayProps, maybeAdd);
      }
      for (var name in obj) maybeAdd(name);
    }

    if (context && context.length) {
      // If this is a property, see if it belongs to some object we can
      // find in the current environment.
      var mapN = function (item) { 
        return item && item.string; 
      };
      var filterN = function (item) {
        return item != ')';
      };
      var ns = context
        .reverse()
        .map(mapN)
        .filter(filterN)
        .join(".");
      var obj = context[context.length - 1], base;
      var parent = editor.intellisense.get(ns);
      console.log(ns, parent, obj);

      if (obj.type == "variable") {
        if (parent) {
          base = parent.next;
        } else {
          if (options && options.additionalContext)
            base = options.additionalContext[obj.string];
          if (!options || options.useGlobalScope !== false)
            base = base || global[obj.string];
        }
      } else if (obj.type == "property") {
        if (Object.keys(parent.next).length) {
          base = parent.next;
        } else if (parent.itemtype == "method") {
          base = function () {};
        }
      } else if (obj.type == "string") {
        base = "";
      } else if (obj.type == "call") {
        try {
          var rettype = editor.intellisense.get(parent["return"].type);
          base = rettype.next;
        } catch (e) {}
      }
      if (base != null) {
        gatherCompletions(base);
      }
    } else {
      // If not, just look in the global object and any local scope
      // (reading into JS mode internals to get at the local and global variables)
      for (var v = token.state.localVars; v; v = v.next) maybeAdd(v.name);
      for (var v = token.state.globalVars; v; v = v.next) maybeAdd(v.name);
      // if (!options || options.useGlobalScope !== false)
      //   gatherCompletions(global);
      forEach(keywords, maybeAdd);
      // setup intellisense
      editor.intellisense.forEach(function (name) {
        if (found.indexOf(name) === -1) found.push(name);
      });
    }
    
    // slice the string if string has a dot
    var dotAt = options.input.lastIndexOf('.');
    if (dotAt !== -1) {
      options.input = options.input.slice(dotAt + 1);
    }

    // filter
    return found.filter(function(item) {
      var reg = new RegExp('^' + options.input.replace(/[\(\)]/g, ''), 'i');
      return (reg.test(item));
    });
  }
});
