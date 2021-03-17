import {ipcMain} from 'electron';
import robot from 'robotjs'
import vkey from "../utils/vkey";

export interface ScreenVideoInfo {
    screen: {
        width: number;
        height: number
    },
    video: {
        width: number;
        height: number
    }
}

export type RobotKeyData = {
    keyCode: number;
    shift: boolean;
    meta: boolean;
    alt: boolean;
}


export type RobotMouseData = {
    clientX: number;
    clientY: number;
} & ScreenVideoInfo

export type RobotType = 'mouse' | 'key'      // 鼠标 键盘


const robotHandle = (function () {
    function mouseHandle(data: RobotMouseData) {
        const {clientX, clientY, video, screen} = data
        let x = clientX * screen.width / video.width
        let y = clientY * screen.height / video.height
         // robot.moveMouse(x, y)
        // robot.mouseClick()
        console.log(`robot点击了${x},${y}`)
    }
    function keyHandle(data: RobotKeyData) {
        const modifiers = [] // 修饰键

        if (data.meta) {
            modifiers.push('meta')
        }
        if (data.shift) {
            modifiers.push('shift')
        }
        if (data.alt) {
            modifiers.push('alt')
        }
        let key = vkey[data.keyCode].toLowerCase()

        if (key[0] !== '<') {
            robot.keyTap(key, modifiers)
            console.log(`按了a按键${key}`)
        }


    }

    return {
        mouseHandle,
        keyHandle
    }
})()

export default function onRobot() {
    ipcMain.on('robot', (e, type: RobotType, data: RobotKeyData | RobotMouseData) => {
        if (type === 'mouse') {
            robotHandle.mouseHandle(data as RobotMouseData)
        } else if (type === 'key') {
            robotHandle.keyHandle(data as RobotKeyData)
        }
    })
}