import {ipcRenderer} from 'electron'
import peer from "./events";

const geneRobotKeyData = (e: KeyboardEvent) => {
    return {
        keyCode: e.keyCode,
        shift: e.shiftKey,
        meta: e.metaKey,
        alt: e.altKey
    }
}

const geneRobotMouseData = (e: MouseEvent) => {
    return {
        clientX: e.clientX,
        clientY: e.clientY,
        video: {
            // width:
        }
    }
}

export  function setRobot(videoDom: HTMLVideoElement) {

    window.addEventListener('keydown', (e) => {
        const data = geneRobotKeyData(e)

        peer.emit('robot', 'key', data)
    })

    window.addEventListener('mouseup', (e) => {
        const data = geneRobotMouseData(e)
        data.video = {
            width: videoDom.getBoundingClientRect().width,
            height: videoDom.getBoundingClientRect().height
        }
        peer.emit('robot', 'mouse', data)
    })
}