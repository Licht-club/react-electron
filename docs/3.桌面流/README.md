## electron桌面流-从桌面窗口捕获视频和音频

> 访问那些从桌面上捕获音频和视频的媒体源信息。

## 本文起步工程

> https://github.com/Licht-club/react-electron/tree/2.mainWithRender

## 本文文档汇总

[桌面流API文档](https://www.electronjs.org/docs/api/desktop-capturer)
[robotjs官方文档](https://robotjs.io/docs/)

## 桌面流的使用

> 为了方便调试,我们使用`render-process\control\index.html`这个渲染线程






`window平台` 需要提前在windows  PowerShell中以管理员的身份运行npm install --global --production windows-build-tools
详细的信息请看这个链接：[https://github.com/octalmage/robotjs](https://github.com/octalmage/robotjs)


`yarn add robotjs --save`

```shell
npm rebuild --runtime=electron --target=11.3.0 --disturl=https://atom.io/download/atom-shell --abi=83 
```
[根据nodejs版本查找abi](https://github.com/mapbox/node-pre-gyp/blob/master/lib/util/abi_crosswalk.json)

自动编译

```shell
npm install electron-rebuild --save-dev

npx electron-rebuild
```
npm config set msvs_version 2019

https://github.com/nodejs/node-gyp#on-windows

vkey
https://github.com/chrisdickinson/vkey 
