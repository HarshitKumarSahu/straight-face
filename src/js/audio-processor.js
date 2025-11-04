class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input.length > 0) {
            const leftChannel = input[0]; // Mono left channel Float32Array
            // Post the raw samples to main thread (via port)
            this.port.postMessage({ channelData: leftChannel });
        }
        return true; // Keep processor alive
    }
}

// Register the processor
registerProcessor('audio-processor', AudioProcessor);