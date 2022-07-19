/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-06-28 14:52:52
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-07-19 16:48:15
 */

const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
const ejse = require('ejs-electron')

const iconUrl = url.format({
    pathname: path.join(__dirname, '/assets/Icon.icns'),
    protocol: 'file:',
    slashes: true
});

// const image = electron.nativeImage.createFromPath(
//     app.getAppPath() + "/test.icns");
// app.dock.setIcon(image);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

//ejse.data('username', 'Some Guy') //this is how we send data

// app.on('ready', () => {
//     mainWindow = new BrowserWindow()
//     mainWindow.loadURL('file://' + __dirname + '/index.ejs')
// })

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        icon: __dirname + '/assets/Icon.icns',
        backgroundColor: "#ccc",
        webPreferences: {
            nodeIntegration: true, // to allow require
            contextIsolation: false, // allow use with Electron 12+
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadURL('file://' + __dirname + '/index.ejs')

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit()
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

