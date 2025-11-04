const rp = require('request-promise')
const _delay = require('lodash/delay') // Add lodash delay if not imported; or use setTimeout wrapper

// Retry helper with exponential backoff
const retryRequest = async (requestFn, maxRetries = 3, baseDelay = 500) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await requestFn()
        } catch (err) {
            if (err.statusCode === 403 && err.error.includes('CONCURRENCY_LIMIT_EXCEEDED') && attempt < maxRetries) {
                const delayMs = baseDelay * Math.pow(2, attempt) // 500, 1000, 2000ms
                console.log(`Face++ concurrency limit hit (attempt ${attempt + 1}/${maxRetries}). Retrying in ${delayMs}ms...`)
                await new Promise(res => setTimeout(res, delayMs))
                continue
            }
            throw err // Re-throw non-retryable
        }
    }
}

// take a snapshot stream and run face detection
const detect = async (dataURL) => {
    const base64 = dataURL.replace(/^data:image\/(png|jpg|jpeg);base64,/, '') // Broaden regex for jpeg
    const requestFn = () => rp.post({
        url: 'https://api-us.faceplusplus.com/facepp/v3/detect',
        formData: {
            api_key: process.env.FACE_PLUS_KEY,
            api_secret: process.env.FACE_PLUS_SECRET,
            image_base64: base64,
        },
    }).then(result => JSON.parse(result))

    return retryRequest(requestFn)
}

// Receive a valid face token and run through analysis
const analyze = async (token) => {
    const requestFn = () => rp.post({
        url: 'https://api-us.faceplusplus.com/facepp/v3/face/analyze',
        formData: {
            api_key: process.env.FACE_PLUS_KEY,
            api_secret: process.env.FACE_PLUS_SECRET,
            face_tokens: token,
            return_landmark: 1,
            return_attributes: 'gender,age,emotion,facequality',
        },
    }).then(result => JSON.parse(result))

    return retryRequest(requestFn)
}

exports.detect = detect
exports.analyze = analyze