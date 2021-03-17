import {desktopCapturer} from 'electron'
import React, {useEffect, useMemo, useRef} from "react";
import {getDesSource} from "./getDesSource";
import {setRobot} from "./setRobot";

const DesktopCapturerVideo = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const handleStream = (stream: MediaStream) => {
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
        setRobot(videoRef.current!)
    }, [])


    return <video ref={videoRef}></video>
}

export default DesktopCapturerVideo