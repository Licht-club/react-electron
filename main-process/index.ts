import {app, BrowserWindow} from 'electron'
import {create} from './mainWindow'
import {ipc} from "./ipc";
import onRobot from "./onRobot";

app.allowRendererProcessReuse = false

app.on('ready', () => {
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'; // 关闭web安全警告
    ipc()
    onRobot()
    create()

})
