/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-07-20 14:21:39
 * @ Modified by: Jean Alinei
 * @ Modified time: 2022-09-07 13:48:22
 * @ Description:
 */

/* copy pasta from circuitJs electron porting files */

const { remote, dialog } = require('electron');
const fs = require('fs');

var lastSavedFilePath = null;

window.showSaveDialog = function () { return remote.dialog.showSaveDialog(null); } 
window.saveFile = function (file, text) {
  var path;
  if (!file)
    path = lastSavedFilePath;
  else {
    path = file.filePath.toString();
    lastSavedFilePath = path;
  }
  fs.writeFile(path, text, function (err) { if (err) window.alert(err); });
}

window.openFile = function (callback) {
  remote.dialog.showOpenDialog({ properties: ['openFile']}).then(function(result) {
    if (result == undefined) return;
    var fileName = result.filePaths[0];
    fs.readFile(fileName, 'utf-8', function (err, data) {
      if (err) { if (err) window.alert(err); return; }
      lastSavedFilePath = fileName;
      var shortName = fileName.substring(fileName.lastIndexOf('/')+1);
      shortName = shortName.substring(shortName.lastIndexOf("\\")+1);
      callback(data, shortName);
    });
  });
}

window.toggleDevTools = function () {
  remote.getCurrentWindow().toggleDevTools();
}

// const arguments = remote.getGlobal('sharedObject').prop1;
// if (arguments.length > 1) {
//   // arguments[1] gets destroyed somehow
//   var arg1 = arguments[1];
//   fs.readFile(arguments[1], 'utf-8', function (err, data) {
//     if (err) { if (err) window.alert(err); return; }
//     lastSavedFilePath = arg1;
//     window.startCircuitText = data;
//   });
// }
/* End of copy pasta */

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})
