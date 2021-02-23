import {ipcMain} from 'electron'
import {send} from './mainWindow'
import {createControlWindow} from "./controlWindow";
export function ipc(){
    ipcMain.handle('login',async ()=>{
      // mock一个状态码
      const  code=Math.floor(Math.random()*(999999-100000))+100000;
      return code;
    })

    ipcMain.on('control',async(e,remoteCode:string)=>{
        // 这里跟服务端交互，但是mock返回
        send('control-state-change',remoteCode,1)
        createControlWindow()
    })
}
