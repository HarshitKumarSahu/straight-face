import detectAndDrawEmotions from './detectAndDrawEmotions'
import initAudioVisualizer from './initAudioVisualizer'
import drawFaceLandmarks from './drawFaceLandmarks'
import setNextPhrase from './setNextPhrase'
import onTranscript from './onTranscript'
import getStream from './getStream'
import io from 'socket.io-client'

// Constants
const EMOTION_THRESHOLD = 66, // between 0 - 100, impossible - easy
    TF_FRAME_RATE = 10

// Init vars
let videoLoaded = false

// Init phase 03
export default async () => {
    // Get user media
    const stream = await getStream()

    // Switch body phrase classes to show the right elements
    document.body.classList.remove('phase-02-active')
    document.body.classList.add('phase-03-active')

    // Set tracking class
    document.body.classList.add('tracking')

    // Set viewbox to stream dims
    const streamW = stream.getVideoTracks()[0].getSettings().width
    const streamH = stream.getVideoTracks()[0].getSettings().height
    const landmarkSVG = document.querySelector('svg.landmarks')
    landmarkSVG.setAttribute('viewBox', `0 0 ${streamW} ${streamH}`)

    // create socket connection
    const socket = io()

    // Show video feed
    var video = document.querySelector('video.face-readout')
    video.dataset.streamWidth = streamW
    video.dataset.streamHeight = streamH
    video.srcObject = stream
    video.onloadedmetadata = async () => {
        video.play()
        await new Promise((res) => setTimeout(res, 100))
        videoLoaded = true

        // Init emotion detection loop
        let emotionInterval = setInterval(() => {
            // class removed, clear
            if (!document.body.classList.contains('tracking')) {
                return clearInterval(emotionInterval)
            }

            detectAndDrawEmotions(video, socket)
        }, 500)
    }

    // Display initial phrase
    // for user to speak
    setNextPhrase()

    // Handle server errors (now only relevant for Face++)
    socket.on('server.error', (errData) => {
        console.error('Server Error:', errData)
    })
    
    // Bump emotion poll to 750ms (reduce concurrency ~1.3/sec)
    let emotionInterval = setInterval(() => {
        // class removed, clear
        if (!document.body.classList.contains('tracking')) {
            return clearInterval(emotionInterval)
        }
    
        detectAndDrawEmotions(video, socket)
    }, 750) // Was 500

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const source = initAudioVisualizer(audioCtx, stream)

    // === Web Speech API (client-side speech recognition) ===
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.continuous = true
        recognition.interimResults = true

        recognition.onresult = (event) => {
            if (!event.results) return
            // Convert Web Speech results to existing onTranscript payload shape
            const lastIndex = event.results.length - 1
            const res = event.results[lastIndex]
            const text = res[0] && res[0].transcript ? res[0].transcript : ''
            const confidence = res[0] && typeof res[0].confidence === 'number' ? res[0].confidence : (res.isFinal ? 0.99 : 0.8)
            onTranscript({
                results: [{
                    alternatives: [{ transcript: text, confidence }],
                    isFinal: res.isFinal
                }]
            })
        }

        recognition.onerror = (e) => {
            console.error('Web Speech error:', e.error || e.message || e)
        }

        recognition.onend = () => {
            // Auto-restart while tracking is active
            if (document.body.classList.contains('tracking')) {
                try { recognition.start() } catch (_) {}
            }
        }

        try { recognition.start() } catch (err) {
            console.error('Web Speech start failed:', err)
        }
    } else {
        console.warn('Web Speech API not supported in this browser.')
    }

    // Load the TensorFlow face detection
    // model (this takes a second)
    const model = await blazeface.load()

    // Init face detection loop
    let faceInterval = setInterval(async () => {
        // make sure "tracking" class is still present
        if (!document.body.classList.contains('tracking')) {
            return clearInterval(faceInterval)
        }

        // class still there, if video is loaded...
        if (videoLoaded) {
            // draw landmarks to video
            const predictions = await model.estimateFaces(video)
            drawFaceLandmarks(predictions)
        }
    }, 1000 / TF_FRAME_RATE)
}