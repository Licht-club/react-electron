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
