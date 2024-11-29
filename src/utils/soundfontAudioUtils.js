// File: src/utils/soundfontAudioUtils.js
import Soundfont from 'soundfont-player';

let audioContext = null;
let instrument = null;

export const INSTRUMENTS = {
  'acoustic_guitar_nylon': 'Acoustic Guitar (nylon)',
  'acoustic_guitar_steel': 'Acoustic Guitar (steel)',
  'electric_guitar_clean': 'Electric Guitar (clean)',
  'electric_guitar_jazz': 'Electric Guitar (jazz)',
  'electric_guitar_muted': 'Electric Guitar (muted)',
  'overdriven_guitar': 'Overdriven Guitar',
  'distortion_guitar': 'Distortion Guitar',
  'guitar_harmonics': 'Guitar Harmonics'
};

export const initializeAudio = async () => {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  await audioContext.resume();
};

export const loadInstrument = async (instrumentName) => {
  if (!audioContext) {
    await initializeAudio();
  }
  instrument = await Soundfont.instrument(audioContext, instrumentName);
  console.log(`Loaded instrument: ${instrumentName}`);
};

export const playNote = (note, duration = 0.5) => {
  if (!instrument) {
    console.error('Instrument not loaded. Call loadInstrument first.');
    return;
  }
  instrument.play(note, audioContext.currentTime, { duration });
};

export const playChord = (notes, duration = 0.5) => {
  if (!instrument) {
    console.error('Instrument not loaded. Call loadInstrument first.');
    return;
  }
  notes.forEach(note => instrument.play(note, audioContext.currentTime, { duration }));
};

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];