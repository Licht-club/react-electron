const {desktopCapturer, ipcRenderer} = require('electron')
const EventEmitter = require('events')
const video = document.getElementById('screen-video');
const peer = new EventEmitter()


function play(stream) {
  video.srcObject = stream;
  video.onloadedmetadata = () => video.play()
}

function getScreenStream() {//获取屏幕的信息
  return new Promise((_resolve, _reject) => {//对视频音频进行约束条件
    desktopCapturer.getSources({types: ['window', 'screen']}).then(async sources => {
      console.log(sources)//获取的对象如图所示在下面
      for (const source of sources) {
        try {
          // 获取媒体流  stream: MediaStream
          const stream = await navigator.mediaDevices.getUserMedia({ // 描述获取什么样的媒体流
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id,
                maxWidth: window.screen.width,
                maxHeight: window.screen.height,
              }
            }
          })
          play(stream)
        } catch (reject) {
          console.error(reject)
        }
      }
    })
  })
}

getScreenStream()//调用

window.onkeydown = function (e) {
  let data = {
    keyCode: e.keyCode,
    shift: e.shiftKey,
    meta: e.metaKey,
    control: e.controlKey,
    alt: e.altKey
  }
  peer.emit('robot', 'key', data)
}

window.onmouseup = function (e){
  let data = {
    clientX:e.clientX,
    clientY:e.clientY,
    video:{
      width:video.getBoundingClientRect().width,
      height:video.getBoundingClientRect().height
    }
  }
  peer.emit('robot','mouse',data)
}


peer.on('robot', (type, data) => {
  if (type === 'mouse') {
    data.screen = {
      width: window.screen.width,
      height: window.screen.height
    }
  }
  setTimeout(() => {
    ipcRenderer.send('robot', type, data)
  }, 0)
})
