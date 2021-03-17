# electron桌面流和远程桌面控制

## 本文相关文档

[desktop-capturer(桌面窗口捕获视频)](https://www.electronjs.org/docs/api/desktop-capturer)

[robotjs](https://github.com/octalmage/robotjs)

## 本门起步项目

> https://github.com/Licht-club/react-electron/tree/05.electron_desktop_capturer_start

```
分支主要更新
1. webpack多入口多页面,多个渲染线程可以用同一个webpack配置完成
2. webpack一些基础优化
```

## desktop-capturer的使用

/render-process/control/getDesSource.ts

> 这段是获取桌面流的核心逻辑,基本都是上面的[desktop-capturer(桌面窗口捕获视频)](https://www.electronjs.org/docs/api/desktop-capturer) 文档复制的

修改了两个地方:
1. `if (source.name === 'Electron')`这个判断先注释了
2. `video:{mandatory:{}}` 这边的配置的`es.dom`的签名不匹配,需要使用`@ts-ignore`的魔法注释

```ts
import {desktopCapturer,} from 'electron'

export type handleStream = (stream: MediaStream) => void
export type handleError = (err: Error) => void

export function getDesSource(handleStream: handleStream, handleError ?: handleError) {
    desktopCapturer.getSources({types: ['window', 'screen']}).then(async sources => {
        for (const source of sources) {
            // if (source.name === 'Electron') {   }
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                            // @ts-ignore
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: source.id,
                                minWidth: 1280,
                                maxWidth: 1280,
                                minHeight: 720,
                                maxHeight: 720
                            }
                        }
                    })
                    handleStream(stream)
                } catch (e) {
                    handleError && handleError(e)
                }
                return

        }
    })

}
```


render-process/control/DesktopCapturerVideo.tsx

> 封装一个video组件,调用上面的`getDesSource`方法

```tsx
import {desktopCapturer} from 'electron'
import React, {useEffect, useMemo, useRef} from "react";
import {getDesSource} from "./getDesSource";
const DesktopCapturerVideo = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const handleStream = (stream: MediaStream) => {
        console.log(videoRef.current)
        if (videoRef.current) {
            const video = videoRef.current
            video.srcObject = stream
            video.onloadedmetadata = (e) => video.play()
        }
    }
    const handleError = (error:Error) => {
        console.log(error,'获取桌面流出错')
    }
    useEffect(() => {
        getDesSource(handleStream, handleError)
    }, [])
    return <video ref={videoRef}></video>
}

export default DesktopCapturerVideo
```

render-process/control/index.tsx

> 渲染线程(控制页面)调用`DesktopCapturerVideo`组件


```tsx
import ReactDom from "react-dom";
import React, {useEffect} from "react";
import DesktopCapturerVideo from "./DesktopCapturerVideo";
function App(){

    return <div>
        <span>模拟远程控制台</span>
        <DesktopCapturerVideo />
    </div>
}
ReactDom.render(<App></App>, document.getElementById('root'))
```

启动进程

看到捕获成功


## 小插曲-引入concurrently

可以看到,我们目前的项目启动比较麻烦,需要起三个服务,一个react/webpack的渲染服务,一个tsc的实时编译服务,一个electron的窗口服务

这种情况,可以使用[这种情况,可以使用concurrently](https://www.npmjs.com/package/concurrently)  解决


#### 安装

```shell
$ npm install -g concurrently
or
$ npm install concurrently --save
```

我这里就不全局安装了


#### 

配置启动命令

```
 "start:dev": "concurrently -k -p \"[{name}]\" -n \"React,TypeScript,Electron\" -c \"yellow.bold,cyan.bold,green.bold\" \"npm run start:react\" \"npm run dev:main\" \"npm run start:electron\""
```

执行`start:dev`,查看命令行,可以看到`React`,`TypeScript`,`Electron`三个线程都启动了,但是electron窗口是空白的,
这是因为在`Electron`线程启动成功的时候,React线程还没完成启动,可以在electron窗口刷新解决,或者使用 [wait-on](https://www.npmjs.com/package/wait-on)


#### [wait-on](https://www.npmjs.com/package/wait-on)

###### wait-on安装

```shell
npm install wait-on # local version
OR
npm install -g wait-on # global version
```

###### 修改我们的`start:dev`命令

```shell
"start:dev": "concurrently -k -p \"[{name}]\" -n \"React,TypeScript,Electron\" -c \"yellow.bold,cyan.bold,green.bold\" \"npm run start:react\" \"npm run dev:main\" \" wait-on http://localhost:8080/main.html && npm run start:electron\""
```

###### 启动

可以看到,我们的`Electron`线程成功卡在React后面才启动


## 远程控制

> robotjs实现了桌面自动化,可以控制鼠标和屏幕


#### robotjs的安装



```shell
npm install robotjs  // 安装需要一段时间
```

安装成功后,重启`start:dev`,在electron窗口中输入`require('robotjs')`,
会发现出现报错

6.报错图

报这个错误的原因 :robotjs是基于c++编写的，在不同的平台，不同的node版本环境需要重新编译。

#### robotjs的编译(build)

请确保在对应的平台已经安装对应的依赖

```shell
Windows
  windows-build-tools npm package (npm install --global --production windows-build-tools 
  from an elevated PowerShell or CMD.exe)
Mac
  Xcode Command Line Tools.
Linux
  Python (v2.7 recommended, v3.x.x is not supported).
  make.
  A C/C++ compiler like GCC.
  libxtst-dev and libpng++-dev (sudo apt-get install libxtst-dev libpng++-dev).
```

开始编译


```shell
$ npm install electron-rebuild --save-dev
```

```shell
$ npx electron-rebuild
```

编译成功如果


######  main-process/index.ts

> 需要关闭`app.allowRendererProcessReuse`

```ts
import {app, BrowserWindow} from 'electron'
import {create} from './mainWindow'
import {ipc} from "./ipc";

app.allowRendererProcessReuse = false  // 默认为true,防止在渲染器进程中加载非上下文感知的本机模块。

app.on('ready', () => {
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'; // 关闭web安全警告
    ipc()
    create()
})

```

重启`start:dev`,再次尝试`reqire('rebotjs')`,如果可以成功,就说明安装成功了~

#### robotjs的使用

main-process/onRobot.ts

> robotjs只能在主进程中运行，所以robotjs代码在主进程通过ipc的方法，让渲染进程调用主进程去做软件控制(键盘和鼠标)

```ts
import {ipcMain} from 'electron';
import robot from 'robotjs'

export interface RobotData {
    keyCode: number;
    shift: boolean;
    meta: boolean;
    alt: boolean;
    screen?: {
        width: number;
        height: number
    },
    video?: {
        width:number;
        height:number;
    }
}

export type RobotType = 'mouse' | 'key'      // 鼠标 键盘

const robotHandle = (function () {
    function mouseHandle(data: RobotData) {
        console.log(data, '暂时逻辑--mouseHandle')
    }

    function keyHandle(data: RobotData) {
        console.log(data, '暂时逻辑--keyHandle')
    }

    return {
        mouseHandle,
        keyHandle
    }
})()

export default function onRobot() {
    ipcMain.on('robot', (e, type: RobotType, data: RobotData) => {
        if (type === 'mouse') {
            robotHandle.mouseHandle(data)
        } else if (type === 'key') {
            robotHandle.keyHandle(data)
        }
    })
}
```

main-process/index.ts

> 主线程入口添加上面封装的逻辑

```ts
import {app, BrowserWindow} from 'electron'
import {create} from './mainWindow'
import {ipc} from "./ipc";
import onRobot from "./onRobot";

app.allowRendererProcessReuse = false

app.on('ready', () => {
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'; // 关闭web安全警告
    ipc()
    create()
    onRobot()
})
```


render-process/control/events.ts

> 使用nodejs内置的events模块(发布订阅模式) 

```ts
import Events from 'events'
import {RobotData, RobotType} from "../../main-process/onRobot";
import {ipcRenderer} from "electron";

const peer = new Events()

peer.on('robot', (type: RobotType, data: RobotData) => {
    if (type === 'mouse') {
        data.screen = {
            width: window.screen.width,
            height: window.screen.height
        }
    }
    // ipcRenderer.send 通信主线程
    ipcRenderer.send('robot', type, data)
})

export default peer;
```

render-process/control/setRobot.ts

> 渲染线程监听鼠标和键盘事件

```ts
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
```

render-process/control/DesktopCapturerVideo.tsx

> 控制台(video)组件引入上面的监听逻辑,


```ts
 useEffect(() => {
        getDesSource(handleStream, handleError)
        setRobot(videoRef.current!)
    }, [])
```


重启项目,点击鼠标或者键盘,查看命令行输出

9.打印成功


梳理下这套流程

```
渲染线程: 页面监听mouseup->event.emit
渲染线程: event.on->ipcRender.send
主线程: ipcMain.on
```


#### 完善主线程的handle逻辑


/utils/vkey.ts

> 键盘映射,出处: https://github.com/chrisdickinson/vkey/blob/master/index.js    又水了100多行QaQ

```ts
'use strict'

var ua = typeof window !== 'undefined' ? window.navigator.userAgent : ''
    , isOSX = /OS X/.test(ua)
    , isOpera = /Opera/.test(ua)
    , maybeFirefox = !/like Gecko/.test(ua) && !isOpera

let i=0;

let  output :Record<number, string> =  {
    0:  isOSX ? '<menu>' : '<UNK>'
    , 1:  '<mouse 1>'
    , 2:  '<mouse 2>'
    , 3:  '<break>'
    , 4:  '<mouse 3>'
    , 5:  '<mouse 4>'
    , 6:  '<mouse 5>'
    , 8:  '<backspace>'
    , 9:  '<tab>'
    , 12: '<clear>'
    , 13: '<enter>'
    , 16: '<shift>'
    , 17: '<control>'
    , 18: '<alt>'
    , 19: '<pause>'
    , 20: '<caps-lock>'
    , 21: '<ime-hangul>'
    , 23: '<ime-junja>'
    , 24: '<ime-final>'
    , 25: '<ime-kanji>'
    , 27: '<escape>'
    , 28: '<ime-convert>'
    , 29: '<ime-nonconvert>'
    , 30: '<ime-accept>'
    , 31: '<ime-mode-change>'
    , 32: '<space>'
    , 33: '<page-up>'
    , 34: '<page-down>'
    , 35: '<end>'
    , 36: '<home>'
    , 37: '<left>'
    , 38: '<up>'
    , 39: '<right>'
    , 40: '<down>'
    , 41: '<select>'
    , 42: '<print>'
    , 43: '<execute>'
    , 44: '<snapshot>'
    , 45: '<insert>'
    , 46: '<delete>'
    , 47: '<help>'
    , 91: '<meta>'  // meta-left -- no one handles left and right properly, so we coerce into one.
    , 92: '<meta>'  // meta-right
    , 93: isOSX ? '<meta>' : '<menu>'      // chrome,opera,safari all report this for meta-right (osx mbp).
    , 95: '<sleep>'
    , 106: '<num-*>'
    , 107: '<num-+>'
    , 108: '<num-enter>'
    , 109: '<num-->'
    , 110: '<num-.>'
    , 111: '<num-/>'
    , 144: '<num-lock>'
    , 145: '<scroll-lock>'
    , 160: '<shift-left>'
    , 161: '<shift-right>'
    , 162: '<control-left>'
    , 163: '<control-right>'
    , 164: '<alt-left>'
    , 165: '<alt-right>'
    , 166: '<browser-back>'
    , 167: '<browser-forward>'
    , 168: '<browser-refresh>'
    , 169: '<browser-stop>'
    , 170: '<browser-search>'
    , 171: '<browser-favorites>'
    , 172: '<browser-home>'

    // ff/osx reports '<volume-mute>' for '-'
    , 173: isOSX && maybeFirefox ? '-' : '<volume-mute>'
    , 174: '<volume-down>'
    , 175: '<volume-up>'
    , 176: '<next-track>'
    , 177: '<prev-track>'
    , 178: '<stop>'
    , 179: '<play-pause>'
    , 180: '<launch-mail>'
    , 181: '<launch-media-select>'
    , 182: '<launch-app 1>'
    , 183: '<launch-app 2>'
    , 186: ';'
    , 187: '='
    , 188: ','
    , 189: '-'
    , 190: '.'
    , 191: '/'
    , 192: '`'
    , 219: '['
    , 220: '\\'
    , 221: ']'
    , 222: "'"
    , 223: '<meta>'
    , 224: '<meta>'       // firefox reports meta here.
    , 226: '<alt-gr>'
    , 229: '<ime-process>'
    , 231: isOpera ? '`' : '<unicode>'
    , 246: '<attention>'
    , 247: '<crsel>'
    , 248: '<exsel>'
    , 249: '<erase-eof>'
    , 250: '<play>'
    , 251: '<zoom>'
    , 252: '<no-name>'
    , 253: '<pa-1>'
    , 254: '<clear>'
}

for(i = 58; i < 65; ++i) {
    output[i] = String.fromCharCode(i)
}

// 0-9
for(i = 48; i < 58; ++i) {
    output[i] = (i - 48)+''
}

// A-Z
for(i = 65; i < 91; ++i) {
    output[i] = String.fromCharCode(i)
}

// num0-9
for(i = 96; i < 106; ++i) {
    output[i] = '<num-'+(i - 96)+'>'
}

// F1-F24
for(i = 112; i < 136; ++i) {
    output[i] = 'F'+(i-111)
}

export default output

```


#### 发现一个bug

主线程打包出来的文件目录`dist/main-process/index.js`,但是package.json里面的main字段错误了

正确的应该是` "main": "dist/main-process/index.js"`


#### 继续

main-process/onRobot.ts

```ts
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

```


#### 遗留问题

- 我们如何测试控制他人桌面的功能
- 桌面流如何选择需要被监控的程序  
- 键盘事件会执行多次,原因未知