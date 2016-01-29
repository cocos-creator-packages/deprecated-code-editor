'use strict';

const Fs = require('fire-fs');
const Helper = require('./helper.js');
const EsprimaJavaScriptContentAssistProvider = require('./esprima/esprimaJsContentAssist.js').EsprimaJavaScriptContentAssistProvider;

var instance;

// get or create a summary for the file
  // `file_name` is a path relative to current editting file, such as `./test.js`
function getOrCreateFileSummary(fileName) {
  var summary = instance.fileSummaries[fileName];
  if (!summary) {
    // generate summary for the file
    if (!Fs.existsSync(fileName)) {
      // console.log(this.fileName + ' require unexists file: ' + fileName);
      return null;
    }

    var fileContent = Fs.readFileSync(fileName, 'utf-8');
    summary = saveFileSummary(fileName, fileContent,false);
  }

  return summary;
}

function retrieveSummary(fileName) {
  // get the summary of `file_name`, if it is not exists, then generate it if possible
  fileName = Helper.findFile(fileName + '.js');
  if (fileName)
    return getOrCreateFileSummary(fileName);
  else
    return null;
}

// record files that are in computing summary to avoid requiring circle
// for example, a require b, and b require a, it will cause dead loop 
// if don't recording which file is in computing summary
var filesInComputingSummary = {};

function saveFileSummary(fileName, fileContent, forceSave) {
  // if the summary is exists, then return
  if (instance.fileSummaries[fileName] && !forceSave)
    return instance.fileSummaries[fileName];

  // the file is in computing summary, we shoud return to avoid dead loop
  if (filesInComputingSummary[fileName]) {
    console.log('Warning: require circle in ' + fileName);
    Helper.disableCocosCompleter();

    throw ('Warning: require circle in ' + fileName);
  }

  if (instance.projectPath === fileName) {
    Helper.disableCocosCompleter();
    console.log('Warning: require circle in ' + fileName);
    throw ('Warning: require circle in ' + fileName);
  }

  filesInComputingSummary[fileName] = true;
  var summary = instance.esprima.computeSummary(fileContent, fileName);
  delete filesInComputingSummary[fileName];

  instance.fileSummaries[fileName] = summary;
  return summary;
}

var indexers = {
  retrieveGlobalSummaries : function(){},
  retrieveSummary : retrieveSummary,
}

var EsprimaHelper = function(projectPath) {
  this.projectPath = projectPath;
  this.esprima = new EsprimaJavaScriptContentAssistProvider(indexers);
  this.fileSummaries = {};
  instance = this;

  this.computeCompletions = function(buf, offset, prefix) {
    return this.esprima.computeCompletions(buf, offset, prefix);
  }
}


EsprimaHelper.prototype.constructor = EsprimaHelper;

module.exports = EsprimaHelper;


