// File: src/utils/audioUtils.js

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const createOscillator = (frequency, type = 'sine') => {
  const oscillator = audioContext.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  return oscillator;
};

const createGain = () => {
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  return gain;
};

export const playNote = (frequency, duration = 0.5, instrument = 'sine') => {
  const oscillator = createOscillator(frequency, instrument);
  const gain = createGain();

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  gain.gain.setValueAtTime(0.7, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

export const getNoteFrequency = (note) => {
  const A4 = 440;
  const A4Index = 9; // Index of A in the NOTES array
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteIndex = notes.indexOf(note);
  const octave = 4; // Assuming middle octave
  const halfSteps = noteIndex - A4Index + (octave - 4) * 12;
  return A4 * Math.pow(2, halfSteps / 12);
};

export const INSTRUMENTS = {
  'Sine': 'sine',
  'Square': 'square',
  'Sawtooth': 'sawtooth',
  'Triangle': 'triangle',
};