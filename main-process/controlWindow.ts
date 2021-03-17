import {BrowserWindow} from 'electron'
import {resolve} from 'path'
import isDev from "electron-is-dev";
let win;
export function createControlWindow() {
    win=new BrowserWindow({
        width:800,
        height:600,
        webPreferences:{
            nodeIntegration:true
        }
    })

    if (isDev) {
        win.webContents.openDevTools() //打开控制台
        win.loadURL('http://localhost:8080/control.html')
    } else {
        // 线上模式, 用react打包的
        win.loadFile(resolve(__dirname, '../render-process/dist-main/control.html'))
    }

}
