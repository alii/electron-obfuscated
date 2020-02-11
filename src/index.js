const { app, BrowserWindow, ipcMain: ipc } = require('electron');
const path = require('path');
let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    height: 550,
    width: 900,
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
};

ipc.on('quit', app.quit);
app.on('ready', createWindow);
app.on('window-all-closed', app.quit);
app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
