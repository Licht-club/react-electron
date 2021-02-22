import {BrowserWindow} from 'electron'
import isDev from 'electron-is-dev'
import {resolve} from 'path'

let win: BrowserWindow;

export function create() {
    win = new BrowserWindow({
        width: 600,
        height: 600,
        webPreferences: {               // 网页功能设置
            nodeIntegration: true,      // 是否在node工作器中启用工作集成默认false
            enableRemoteModule: true,   // 是否启用remote模块默认false
        }
    })
    if (isDev) {
        win.webContents.openDevTools() //打开控制台
        win.loadURL('http://localhost:8080')
    } else {
        // 线上模式, 用react打包的
        win.loadFile(resolve(__dirname, '../render-process/dist-main/index.html'))
    }
    return win
}