const facePlusPlus = require('./facePlusPlus');
const _ = require('lodash');
const createAssemblyStream = require('./assemblyai');

module.exports = {
    connection(client) {
        // === SPEECH TRANSCRIPTION (AssemblyAI) ===
        let speechStream = null;

        client.on('audio.transcript.connect', () => {
            try {
                speechStream = createAssemblyStream(client);
            } catch (err) {
                console.error('Speech connect error:', err.message);
                client.emit('server.error', { type: 'speech', message: err.message });
            }
        });

        client.on('audio.transcript.data', (chunk) => {
            try {
                if (speechStream && chunk) {
                    speechStream.write(chunk);
                }
            } catch (err) {
                console.error('Speech write error:', err.message);
            }
        });

        client.on('disconnect', () => {
            try {
                if (speechStream) speechStream.end();
            } catch (_) {}
        });

        // === ONLY FACE++ EMOTION DETECTION ===
        let faceInFlight = false;
        client.on('video.analysis.snapshot', async (dataURL) => {
            if (faceInFlight) return; // throttle to avoid Face++ concurrency errors
            faceInFlight = true;
            try {
                const detectData = await facePlusPlus.detect(dataURL);
                const detectFormatted = serializeFaceDetect(detectData);
                client.emit('video.detect.result', detectFormatted);

                const token = _.get(detectFormatted, 'faces[0].token');
                if (token) {
                    const analysisData = await facePlusPlus.analyze(token);
                    client.emit('video.analysis.result', serializeFaceAnalyze(analysisData));
                }
            } catch (err) {
                console.error('Face++ Error:', err.message);
                client.emit('server.error', { type: 'facepp', message: err.message });
            } finally {
                // slight cooldown to be safe
                setTimeout(() => { faceInFlight = false; }, 500);
            }
        });

        // === NO SPEECH CODE ===
        // Speech is now 100% client-side
    }
};

// === SERIALIZERS (unchanged) ===
const serializeFaceDetect = (data) => ({
    id: data.image_id,
    faces: data.faces.map(face => ({
        rectangle: face.face_rectangle,
        token: face.face_token,
    })),
});

const serializeFaceAnalyze = (data) => ({
    people: _.get(data, 'faces', []).map(face => {
        const landmark = face.landmark || {};
        return {
            person_id: face.face_token,
            demographics: {
                gender: _.get(face, 'attributes.gender.value', 'unknown'),
                age: _.get(face, 'attributes.age.value', 'unknown'),
            },
            emotions: _.get(face, 'attributes.emotion', {}),
            landmarks: Object.keys(landmark).map(key => ({ [key]: landmark[key] })),
            rectangle: face.face_rectangle,
        };
    }),
});