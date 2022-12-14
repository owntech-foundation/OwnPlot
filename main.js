/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-23 14:14:50
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-09-07 13:47:38
 * @ Description:
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const ejse = require('ejs-electron');

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

let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        icon: icon,
        webPreferences: {
            nodeIntegration: true, // to allow require
            contextIsolation: false, // allow use with Electron 12+
            preload: path.join(__dirname, 'preload.js')
        },
        show: false,
        autoHideMenuBar: true
    });

    mainWindow.loadURL('file://' + __dirname + '/index.ejs');

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                width: 1250,
                height: 800,
                icon: icon,
                autoHideMenuBar: true
            }
        }
    });
      
    mainWindow.maximize();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit();
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

