import { app , BrowserWindow} from 'electron'
import {resolve} from 'path'
let win;
export function createControlWindow() {
    // https://www.electronjs.org/docs/api/app#appallowrendererprocessreuse
    // //为了防止原生模块在渲染进程中被覆盖
    app.allowRendererProcessReuse = false
    win=new BrowserWindow({
        width:300,
        height:300,
        webPreferences:{

            nodeIntegration:true,
            enableRemoteModule: true,   // 是否启用remote模块默认false
        }
    })
    win.webContents.openDevTools() //打开控制台
    win.loadFile(resolve(__dirname,'../render-process/control/index.html'))
}
