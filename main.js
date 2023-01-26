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

let mainWindow;

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

app.whenReady().then(() => {
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
        autoHideMenuBar: false
    });

    mkdirp(app.getPath('userData') + "/config");
    mkdirp(app.getPath('userData') + "/config/buttons");
    copyFolder(__dirname + "/config/buttons", app.getPath('userData') + "/config/buttons");

    ipcMain.on('get-user-data-folder', (event) => {
        event.returnValue = app.getPath('userData');
    });

    mainWindow.loadFile(__dirname + '/index.ejs');
    //mainWindow.loadURL('file://' + __dirname + '/index.ejs')

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
                autoHideMenuBar: false
            }
        }
    });

    mainWindow.maximize();
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit();
})