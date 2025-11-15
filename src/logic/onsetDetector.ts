const FRAME_SIZE = 2048
const HOP_SIZE = 512
const MIN_ONSET_INTERVAL = 0.05

export function calculateRMS(samples: Float32Array, start: number, length: number): number {
  let sumSquares = 0
  for (let i = 0; i < length; i++) {
    const sample = samples[start + i] || 0
    sumSquares += sample * sample
  }
  return Math.sqrt(sumSquares / length)
}

export function detectOnsets(audioBuffer: AudioBuffer, threshold: number): number[] {
  const samples = audioBuffer.getChannelData(0)
  const sampleRate = audioBuffer.sampleRate
  const onsets: number[] = []

  let previousEnergy = 0
  let lastOnsetTime = -MIN_ONSET_INTERVAL

  for (let i = 0; i < samples.length - FRAME_SIZE; i += HOP_SIZE) {
    const rms = calculateRMS(samples, i, FRAME_SIZE)
    const energyIncrease = rms - previousEnergy

    if (energyIncrease > threshold && rms > threshold) {
      const timeInSeconds = i / sampleRate

      if (timeInSeconds - lastOnsetTime >= MIN_ONSET_INTERVAL) {
        onsets.push(timeInSeconds)
        lastOnsetTime = timeInSeconds
      }
    }

    previousEnergy = rms * 0.9
  }

  return onsets
}

export function calculateDynamicThreshold(audioBuffer: AudioBuffer): number {
  const samples = audioBuffer.getChannelData(0)
  let maxRMS = 0

  for (let i = 0; i < samples.length - FRAME_SIZE; i += HOP_SIZE) {
    const rms = calculateRMS(samples, i, FRAME_SIZE)
    if (rms > maxRMS) {
      maxRMS = rms
    }
  }

  return maxRMS * 0.3
}
