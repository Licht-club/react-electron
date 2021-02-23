import {BrowserWindow} from 'electron'
import {resolve} from 'path'
let win;
export function createControlWindow() {
    win=new BrowserWindow({
        width:300,
        height:300,
        webPreferences:{
            nodeIntegration:true
        }
    })
    win.loadFile(resolve(__dirname,'../render-process/control/index.html'))
}
