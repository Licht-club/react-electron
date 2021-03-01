## 桌面流


[桌面流API文档](https://www.electronjs.org/docs/api/desktop-capturer)
[robotjs](https://github.com/octalmage/robotjs)
[robotjs文档](https://robotjs.io/docs/)


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
npm config set msvs_version 2017

https://github.com/nodejs/node-gyp#on-windows
