import {ipcMain} from 'electron'
import robot from 'robotjs'
import vkey from './vkey'

function handleMouse(data: any) {
    let {clientX, clientY, screen, video} = data
    let x = clientX * screen.width / video.width;
    let y = clientY * screen.height / video.height;
    robot.moveMouse(x, y)
    robot.mouseClick()
    console.log("mouse", data)
}

interface keyData {
    keyCode:number;
    meta:any;
    alt:any;
    ctrl:any;
    shift:any;
}

function handleKey(data: keyData) {
    const modifiers = [];//修饰键
    if(data.meta) modifiers.push('meta')
    if(data.shift) modifiers.push('shift')
    if(data.alt) modifiers.push('alt')
    if(data.ctrl) modifiers.push('ctrl')
    console.log(vkey,'vkey')
    let key = vkey[data.keyCode].toLowerCase()
    if(key[0]!=='<'){
        robot.keyTap(key,modifiers)
        console.log('robot keyTap;key: '+ key,data)
    }
}

export function robotHandle() {
    ipcMain.on('robot', (e, type, data: any) => {

        if (type === 'mouse') {
            handleMouse(data)
        } else if (type == 'key') {
            handleKey(data)
        }
    })
}
