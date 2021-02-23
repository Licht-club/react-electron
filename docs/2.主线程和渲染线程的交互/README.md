# electron主线程和渲染线程的交互总结

上一期主题: [手把手教你搭建electron+react+ts环境](https://juejin.cn/post/6931633948372140045/)

本文的起步工程(注意是1.base_env分支): [https://github.com/Licht-club/react-electron/tree/1.base_env](https://github.com/Licht-club/react-electron/tree/1.base_env)

> 因为是承接上一节,当然此节和上一节也没必然关系


#### 本文涉及文档汇总

[ipcMain主进程](http://www.electronjs.org/docs/api/ipc-main)
[ipcRenderer渲染进程](http://www.electronjs.org/docs/api/ipc-renderer)
[webContents](http://www.electronjs.org/docs/api/web-contents#contentssendchannel-args)

#### 交互方式总结

|  主线程   | 渲染线程  | 交互模式  |
|  ----  | ----  |  ----  |
| ipcMain.handle  | ipcRenderer.invoke |  渲染进程请求+主进程响应 |
| webContents.send  | ipcRenderer.on |  主进程推送 |
| ipcMain.on  | ipcRenderer.send |   渲染进程发起请求 |

#### 我们的起步工程

我们要完成的功能:模拟实现一个远程控制客户端
1.模拟渲染线程实现登录,获取自己的控制码
2.模拟请求控制一个用户的窗口

#### 渲染线程实现登录

1. 修改react页面,添加一个登录按钮 
   
/render-process/main/index.tsx

```tsx
import React, {useEffect, useState} from 'react'
import ReactDom from 'react-dom'
import { ipcRenderer } from 'electron'
const App = () => {
    const [localCode,setLocalCode]=useState('');//本身的控制码
    // 模拟登录功能
    const login =async () => {
        // 获取登陆后的控制码
        // 因为登录状态是在主进程维护，通过主进程来处理ipc事件
        const code=await ipcRenderer.invoke('login')
        // 存储控制码
        setLocalCode(code)
    }
    return <div>
        <div>hello react</div>
        {localCode? <div>
            本身的控制码:  {localCode}
        </div>:  <button onClick={()=>login()}>登录</button>}

    </div>
}
ReactDom.render(<App></App>, document.getElementById('root'))
```
> 这里使用了`ipcRenderer.invoke`, Send a message to the main process via channel and expect a result asynchronously. 


2. 主线程响应登录请求

main-process/ipc.ts  封装一个函数,处理主进程的事务

```ts
import {ipcMain} from 'electron'
export function ipc(){
    ipcMain.handle('login',async ()=>{
      // mock一个状态码
      const  code=Math.floor(Math.random()*(999999-100000))+100000;
      return code;
    })
}
```

main-process/index.ts 主入口调用函数,在创建窗口之前

```ts
import {app, BrowserWindow} from 'electron'
import {create} from './mainWindow'
import {ipc} from "./ipc";
app.on('ready', () => {
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'; // 关闭web安全警告
    ipc()
    create()
})
```

重启electron,看下效果

效果图...


##### 总结

```ts
// Renderer process  渲染进程请求
ipcRenderer.invoke('some-name', someArgument).then((result) => {
  // ...
})

// Main process   主进程响应
ipcMain.handle('some-name', async (event, someArgument) => {
  const result = await doSomeWork(someArgument)
  return result
})
```

#### 请求控制一个用户的窗口

/render-process/main/index.tsx 添加一个input和一个button,省略局部代码

```ts
function App(){
    const startControl = (remoteCode:string)=>{
        // 渲染线程发起一个请求
        ipcRenderer.send('control',remoteCode)
    }
    return <div>
        <div>hello react</div>
    {localCode? <div>
        本身的控制码:  {localCode}
        </div>:  <button onClick={()=>login()}>登录</button>}
    <input type="text" value={remoteCode} onChange={e=>setRemoteCode(e.target.value)}/>
    <button onClick={()=>startControl(remoteCode)}>请求控制</button>
    </div>
}
```

main-process/ipc.ts 这里ipcMain.on函数的第二个参数是一个回调函数,ts准确识别出来了类型,剩余参数则要自己指定类型



```ts
import {ipcMain} from 'electron'
export function ipc(){
    ipcMain.handle('login',async ()=>{
      // mock一个状态码
      const  code=Math.floor(Math.random()*(999999-100000))+100000;
      return code;
    })
    ipcMain.on('control',async(e,remoteCode:string)=>{
        console.log(remoteCode,'主线程收到的控制码')
    })
}
```

主线程成功收到请求,我们的这个组合也完成了

图片完成

##### 总结

> 如果您希望从主流程收到单个响应，例如方法调用的结果，请考虑使用ipcRenderer.invoke。
> 如果只是单纯的推送和传输推送数据,用ipcRenderer.send
> 
```ts
// Renderer process  渲染进程推送
ipcRenderer.send('some-name', ...args)

// Main process   主进程监听
ipcMain.on('some-name', async (...args) => {
  
})
```


#### 主线程推送渲染线程

main-process/mainWindow.ts 添加send函数,可以在主线程任意地方使用send函数向渲染线程推送信息

```ts
import {BrowserWindow} from 'electron'
import isDev from 'electron-is-dev'
import {resolve} from 'path'

let win: BrowserWindow;

export function create() {
    // ...
}

export function send(channel:string,...args:any[]){
    win.webContents.send(channel,...args)
}
```

main-process/ipc.ts  接收到渲染进程的请求后向渲染线程推送一个`control-state-change`

```ts
import {ipcMain} from 'electron'
import {send} from './mainWindow'
export function ipc(){
    ipcMain.handle('login',async ()=>{
      // mock一个状态码
      const  code=Math.floor(Math.random()*(999999-100000))+100000;
      return code;
    })

    ipcMain.on('control',async(e,remoteCode:string)=>{
        // 这里跟服务端交互，但是mock返回
        send('control-state-change',remoteCode,1)
    })
}
```

接下来要在渲染线程监听`control-state-change`,在useEffect生命周期添加监听,和给dom添加监听基本一样

render-process/main/index.tsx

```tsx
import React, {useEffect, useState} from 'react'
import ReactDom from 'react-dom'
import {ipcRenderer, IpcRendererEvent} from 'electron'
const App = () => {
    const [localCode,setLocalCode]=useState('');//本身的控制码
    const [remoteCode,setRemoteCode]=useState('');//其他用户的控制码
    const [controlText,setControlText]=useState('');//控制码的文案

    const handleControlState = (e:IpcRendererEvent,name:string,type:number)=>{
        let text='';
        if(type === 1){
            //控制别人
            text=`正在远程控制${name}`
        }
        setControlText(text)//当前页面的文本
    }

    useEffect(()=>{
        ipcRenderer.on('control-state-change',handleControlState)//监听ipc事
        return ()=>{
            //监听函数之后，最好清理掉这个函数(退出时)
            ipcRenderer.removeListener('control-state-change',handleControlState)
        }
    })

    // 模拟登录功能
    const login =async () => {
        // 获取登陆后的控制码
        // 因为登录状态是在主进程维护，通过主进程来处理ipc事件
        const code=await ipcRenderer.invoke('login')
        // 存储控制码
        setLocalCode(code)
    }
    const startControl = (remoteCode:string)=>{
        // 渲染线程发起一个请求
        ipcRenderer.send('control',remoteCode)
    }
    return <div>
        <div>hello react</div>
        {localCode? <div>
            本身的控制码:  {localCode}
        </div>:  <button onClick={()=>login()}>登录</button>}

        <div>
            {controlText}
        </div>

        <input type="text" value={remoteCode} onChange={e=>setRemoteCode(e.target.value)}/>
        <button onClick={()=>startControl(remoteCode)}>请求控制</button>
    </div>
}
ReactDom.render(<App></App>, document.getElementById('root'))

```

这样渲染线程就完成了监听

完成效果图


#### 模拟打开一个被控制的窗口

render\control\index.html  新开一个html

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <div>正在受到控制</div>
</body>
</html>
```


main-process\controlWindow.ts

```ts
import {BrowserWindow} from 'electron'
import {resolve} from 'path'
let win;
export function createControlWindow() {
    win=new BrowserWindow({
        width:800,
        height:800,
        webPreferences:{
            nodeIntegration:true
        }
    })
    win.loadFile(resolve(__dirname,'../render-process/control/index.html'))
}
```

main-process\ipc.ts

> 主线程收到control打开新窗口

```ts
import { createControlWindow } from './controlWindow'
export  function ipcHandle() {
    // ipcMain.handle 主线程响应渲染线程
    ipcMain.handle('login',()=>{
        let code=Math.floor(Math.random()*(999999-100000))+100000;
        console.log(code,'主线程生成的code')
        return code
    })

    ipcMain.on('control',(e,remoteCode)=>{
        send('control-state-change',remoteCode,1)
        createControlWindow()
    })

}
```

最终效果图

本文代码git地址

```

```
