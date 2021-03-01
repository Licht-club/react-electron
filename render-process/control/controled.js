const { desktopCapturer } = require('electron')
const video = document.getElementById('screen-video');

function play(stream){
  video.srcObject=stream;
  video.onloadedmetadata=()=>video.play()
}

function getScreenStream(){//获取屏幕的信息
  return new Promise((_resolve,_reject)=>{//对视频音频进行约束条件
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
      console.log(sources)//获取的对象如图所示在下面
      for (const source of sources) {
        try {
          // 获取媒体流  stream: MediaStream
          const stream = await navigator.mediaDevices.getUserMedia({ // 描述获取什么样的媒体流
            audio: {
              mandatory :{
                chromeMediaSource: 'desktop',
              }
            },
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',

                maxWidth: window.screen.width,
                maxHeight: window.screen.height,
              }
            }
          })
          play(stream)
        }catch(reject){
          console.error(reject)
        }
      }
    })
  })
}
getScreenStream()//调用
