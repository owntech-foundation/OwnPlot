/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-23 14:14:50
 * @ Modified by: Jean Alinei
 * @ Modified time: 2022-09-07 13:47:38
 * @ Description:
 */
const electron = require('electron')
const Menu = electron.Menu

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const ejse = require('ejs-electron');
const fs = require('fs'); //file opening, reading & writing

let icon;
switch (process.platform) {
    case 'win32':
        icon = path.resolve(__dirname, 'assets', 'Icon.ico');
        break;
    case 'darwin':
        icon = path.resolve(__dirname, 'assets', 'Icon.icns');
        //app.dock.setIcon(path.resolve(__dirname, 'assets', 'Icon.png'));
        break;
    case 'linux':
        icon = path.resolve(__dirname, 'assets', 'Icon.png');
        break;
}

var windows = [];
// // save arguments
// global.sharedObject = {prop1: process.argv};

// function createCircuitJsWindow () {
//     // Create the browser window.
//     var circuitJsWindow = new BrowserWindow({width: 800, 
//         height: 600,
//         webPreferences: { nativeWindowOpen: true,
//                         preload: path.join(__dirname, 'preload.js')
//         },
//         show: false,
//     })
//     windows.push(circuitJsWindow);
//     // and load the index.html of the app.
//     circuitJsWindow.loadURL(url.format({
//         // pathname: path.join(__dirname, 'index.html'),
//         pathname: path.join(__dirname, 'war/circuitjs.html'),
//         protocol: 'file:',
//         slashes: true
//     }))
//     // Open the DevTools.
//     // mainWindow.webContents.openDevTools()
//     // Emitted when the window is closed.
//     circuitJsWindow.on('closed', function () {
//       // Dereference the window object, usually you would store windows
//       // in an array if your app supports multi windows, this is the time
//       // when you should delete the corresponding element.
//         var i = windows.indexOf(circuitJsWindow);
//         if (i >= 0)
//             windows.splice(i, 1);
//     })
//     circuitJsWindow.webContents.on('new-window', (evt, url, frameName, disposition, options) => {
//         if (disposition == 'save-to-disk')
//         return;
//         if (!url.endsWith("circuitjs.html"))
//         return;
//         // app is opening a new window.  override it by creating a BrowserWindow to work around an electron bug (11128)
//         evt.preventDefault();
//         createCircuitJsWindow();
//     });
// }

function mkdirp(dir) {
    if (fs.existsSync(dir)) { return true }
    const dirname = path.dirname(dir)
    mkdirp(dirname);
    fs.mkdirSync(dir);
}

function copyFolder(sourceDir, destDir) {
    fs.readdir(sourceDir, (err, files) => {
        if (err)
            console.log(err);
        else {
            files.forEach(file => {
                if (!fs.existsSync(destDir + "/" + file)) { //if the config is already copied, do not overwrite
                    fs.copyFile(sourceDir + "/" + file, destDir + "/" + file, (err) => {
                        if (err) {
                            console.log("Error Found:", err);
                        } else {
                            console.log("file " + file + " successfully copied");
                        }
                    });
                }
            })
        }
    })
}

let ownplotWindow;

app.whenReady().then(() => {
    // Create the browser window.
    ownplotWindow = new BrowserWindow({
        width: 800,
        height: 800,
        icon: icon,
        webPreferences: {
            nodeIntegration: true, // to allow require
            contextIsolation: false, // allow use with Electron 12+
            preload: path.join(__dirname, 'preload.js')
        },
        show: false,
        autoHideMenuBar: false
    });

    windows.push(ownplotWindow);

    mkdirp(app.getPath('userData') + "/config");
    mkdirp(app.getPath('userData') + "/config/buttons");
    copyFolder(__dirname + "/config/buttons", app.getPath('userData') + "/config/buttons");

    ipcMain.on('get-user-data-folder', (event) => {
        event.returnValue = app.getPath('userData');
    });

    ownplotWindow.loadFile(__dirname + '/index.ejs');
    //mainWindow.loadURL('file://' + __dirname + '/index.ejs')

    // Emitted when the window is closed.
    ownplotWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        ownplotWindow = null;
    });

    ownplotWindow.once('ready-to-show', () => {
        ownplotWindow.show();
    });
    
    // createCircuitJsWindow();

    ownplotWindow.webContents.setWindowOpenHandler(({ url }) => {
        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                width: 1250,
                height: 800,
                icon: icon,
                autoHideMenuBar: false
            }
        }   
    });

    ownplotWindow.maximize();
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit();
})