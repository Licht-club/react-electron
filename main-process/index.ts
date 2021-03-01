import {app, BrowserWindow} from 'electron'
import {create} from './mainWindow'
import {createControlWindow} from './controlWindow'
import {ipc} from "./ipc";
app.on('ready', () => {
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'; // 关闭web安全警告
    ipc()
    // create()

    createControlWindow()
})
