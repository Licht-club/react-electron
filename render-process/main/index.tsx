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
