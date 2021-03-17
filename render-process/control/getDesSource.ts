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