import getStream from "./getStream.js"
import setNextPhrase from './setNextPhrase'

// init phase 03
export default async () => {

    // Get user media
    const stream = await getStream()
    
    // hide phase 02 and show phase 03
    document.body.classList.remove("phase-02-active")
    document.body.classList.add("phase-03-active")

    const streamW = stream.getVideoTracks()[0].getSettings().width
    const streamH = stream.getVideoTracks()[0].getSettings().height

    // show video
    var video = document.querySelector("video.face-readout")
    video.dataset.streamWidth = streamW
    video.dataset.streamHeight = streamH
    video.srcObject = stream
    video.onloadedmetadata = async () => {
        video.play()
    }

    // Display initial phrase
    // for user to speak
    setNextPhrase()
    
}