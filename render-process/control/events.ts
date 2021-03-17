import Events from 'events'
import {RobotKeyData, RobotMouseData, RobotType} from "../../main-process/onRobot";
import {ipcRenderer} from "electron";

const peer = new Events()

peer.on('robot', (type: RobotType, data: RobotMouseData | RobotKeyData) => {
    // ipcRenderer.send 通信主线程
    ipcRenderer.send('robot', type, {
        ...data,
        screen: {
            width: window.screen.width,
            height: window.screen.height
        }
    })
})


export default peer;