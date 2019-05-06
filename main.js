'use strict';
const electron = require('electron');

const app = electron.app;

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// Prevent window being garbage collected
let mainWindow;

function onClosed() {
	// Dereference the window
	// For multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 1200,
		height: 700
	});

	win.loadURL(`file://${__dirname}/src/index.html`);
	win.on('closed', onClosed);

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});

const {ipcMain, dialog} = require('electron')
ipcMain.on('open-file-dialog', (event, arg) => {

	const options = {
		title: 'Choose an image file',
		//defaultPath: '/path/to/something/',
		buttonLabel: 'Load',
		filters: [
		  { name: 'Images', extensions: ['jpg', 'png', 'tif', 'gif'] }
		],
		//properties: ['showHiddenFiles'],
		//message: 'This message will only be shown on macOS'
	};

	dialog.showOpenDialog({
	  properties: ['openFile']
	}, (files) => {
	  if (files) {
		event.sender.send('selected-file', files)
	  }
	})
});