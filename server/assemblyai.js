// const { AssemblyAI } = require('assemblyai');

// let transcriber = null;

// module.exports = (client) => {
//     if (transcriber) return makeFacade(transcriber, client);

//     const assembly = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_KEY });

//     // Correct API in v4: realtime.transcriber()
//     transcriber = assembly.realtime.transcriber({
//         // model: 'universal',
//         // sampleRate: 44100,
//         sampleRate: 16000,  // ← 16kHz
//         encoding: 'pcm_s16le',
//         wordBoost: [
//             'chinchilla', 'wiffle', 'pickle', 'spritzer', 'Yahtzee',
//             'Elmo', 'lunch lady', 'mosquito', 'fruitcake', 'backup socks'
//         ],
//         endUtteranceSilenceThreshold: 700,
//     });

//     // Wire events
//     transcriber.on('open', ({ sessionId }) => {
//         console.log('AssemblyAI stream opened:', sessionId);
//     });

//     transcriber.on('transcript', (result) => {
//         if (!client) return;
//         const isFinal = result.message_type === 'FinalTranscript';
//         const text = result.text || '';
//         const confidence = result.confidence || (isFinal ? 0.99 : 0.8);
//         client.emit('audio.transcript.result', {
//             results: [{ alternatives: [{ transcript: text, confidence }], isFinal }]
//         });
//     });

//     transcriber.on('error', (error) => {
//         console.error('AssemblyAI Error:', error.message || error);
//         if (client) client.emit('server.error', { type: 'speech', message: String(error.message || error) });
//     });

//     transcriber.on('close', () => {
//         console.log('AssemblyAI stream closed');
//         transcriber = null;
//     });

//     // Connect immediately (no await, we buffer writes until open)
//     transcriber.connect().catch((err) => {
//         console.error('AssemblyAI connect failed:', err.message || err);
//         if (client) client.emit('server.error', { type: 'speech', message: String(err.message || err) });
//     });

//     return makeFacade(transcriber, client);
// };

// function makeFacade(rt, client) {
//     let isOpen = false;
//     const pendingChunks = [];

//     const onOpen = () => {
//         isOpen = true;
//         // flush limited backlog
//         while (pendingChunks.length) {
//             const c = pendingChunks.shift();
//             try { rt.sendAudio(c); } catch (_) { break; }
//         }
//     };
//     const onClose = () => { isOpen = false; };

//     rt.on('open', onOpen);
//     rt.on('close', onClose);

//     return {
//         write: (chunk) => {
//             try {
//                 if (isOpen) {
//                     rt.sendAudio(chunk);
//                 } else {
//                     // keep small buffer to avoid memory blowup
//                     if (pendingChunks.length > 25) pendingChunks.shift();
//                     pendingChunks.push(chunk);
//                 }
//             } catch (err) {
//                 console.error('AssemblyAI sendAudio error:', err.message || err);
//             }
//         },
//         end: () => {
//             try { rt.close(); } catch (_) {}
//         }
//     };
// }