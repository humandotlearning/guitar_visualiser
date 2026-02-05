// File: src/utils/soundfontAudioUtils.js
import Soundfont from 'soundfont-player';

let audioContext = null;
let instrument = null;
let isLoading = false;
let loadPromise = null;
let loadedSoundfontName = null;

// Sound settings
let globalVolume = 1.0;
let volumeBoost = 2.5;
let globalSustain = 1.5;
let currentInstrumentName = '';

const NOTE_REGEX = /[A-G][#b]?[0-9]/;
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const INSTRUMENTS = {
  'acoustic_guitar_nylon': 'Acoustic Guitar (nylon)',
  'acoustic_guitar_steel': 'Acoustic Guitar (steel)',
  'electric_guitar_clean': 'Electric Guitar (clean)',
  'electric_guitar_jazz': 'Electric Guitar (jazz)',
  'electric_guitar_muted': 'Electric Guitar (muted)',
  'overdriven_guitar': 'Overdriven Guitar',
  'distortion_guitar': 'Distortion Guitar',
  'guitar_harmonics': 'Guitar Harmonics',
  'ukulele': 'Ukulele'
};

// Default instrument
const DEFAULT_INSTRUMENT = 'acoustic_guitar_steel';

// Initialize audio context
export const initializeAudio = async () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume();
    console.log('Audio context initialized');
  }
  return audioContext;
};

// Set global volume (0-1)
export const setVolume = (volume) => {
  if (volume >= 0 && volume <= 1) {
    globalVolume = volume;
    return true;
  }
  return false;
};

// Set volume boost (1.0 or higher)
export const setVolumeBoost = (boost) => {
  if (boost >= 1.0) {
    volumeBoost = boost;
    return true;
  }
  return false;
};

// Set global sustain (seconds)
export const setSustain = (sustain) => {
  if (sustain >= 0.1) {
    globalSustain = sustain;
    return true;
  }
  return false;
};

// Get current volume
export const getVolume = () => globalVolume;

// Get current volume boost
export const getVolumeBoost = () => volumeBoost;

// Get current sustain
export const getSustain = () => globalSustain;

// Get current instrument name
export const getCurrentInstrumentName = () => currentInstrumentName;

// Load instrument with caching
export const loadInstrument = async (instrumentName = DEFAULT_INSTRUMENT) => {
  currentInstrumentName = instrumentName;

  // Map instrument names to soundfont names if needed
  let soundfontName = instrumentName;
  if (instrumentName === 'ukulele') {
    soundfontName = 'acoustic_guitar_nylon';
  }

  // OPTIMIZATION: Return cached instrument if already loaded
  if (instrument && loadedSoundfontName === soundfontName) {
    return instrument;
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  if (!audioContext) {
    await initializeAudio();
  }

  isLoading = true;
  loadPromise = Soundfont.instrument(audioContext, soundfontName, {
    format: 'mp3',
    soundfont: 'MusyngKite',
    gain: globalVolume * volumeBoost,
  }).then(loadedInstrument => {
    instrument = loadedInstrument;
    loadedSoundfontName = soundfontName;
    console.log(`Loaded instrument: ${instrumentName} (soundfont: ${soundfontName}) with volume: ${globalVolume * volumeBoost}`);
    isLoading = false;
    return instrument;
  }).catch(async err => {
    console.error(`Failed to load instrument ${instrumentName}:`, err);
    // Fallback: try to load the default instrument if not already tried
    if (instrumentName !== DEFAULT_INSTRUMENT) {
      try {
        console.warn('Attempting to load default instrument as fallback...');
        instrument = await Soundfont.instrument(audioContext, DEFAULT_INSTRUMENT, {
          format: 'mp3',
          soundfont: 'MusyngKite',
          gain: globalVolume * volumeBoost,
        });
        currentInstrumentName = DEFAULT_INSTRUMENT;
        loadedSoundfontName = DEFAULT_INSTRUMENT; // Assuming default instrument is what it is
        console.log('Fallback to default instrument succeeded.');
        isLoading = false;
        return instrument;
      } catch (fallbackErr) {
        console.error('Failed to load fallback default instrument:', fallbackErr);
        isLoading = false;
        throw new Error('Failed to load both the selected and default instruments. Please check your network connection or try a different instrument.');
      }
    } else {
      isLoading = false;
      throw new Error('Failed to load instrument. Please check your network connection or try a different instrument.');
    }
  });

  return loadPromise;
};

// Map note to MIDI format (C4, D#3, etc.)
export const noteToMidi = (note, octave = 4) => {
  // If note already has octave (like 'C4'), return as is
  if (NOTE_REGEX.test(note)) {
    return note;
  }
  return `${note}${octave}`;
};

// Play a single note
export const playNote = async (note, duration = null, octave = 4) => {
  if (!instrument) {
    try {
      await loadInstrument();
    } catch (err) {
      console.error('Failed to load instrument:', err);
      return;
    }
  }

  // Use global sustain if duration is not provided
  const actualDuration = duration || globalSustain;

  const midiNote = noteToMidi(note, octave);
  return instrument.play(midiNote, audioContext.currentTime, {
    duration: actualDuration,
    gain: globalVolume * volumeBoost
  });
};

// Play a chord (multiple notes at once)
export const playChord = async (notes, duration = null, octave = 4) => {
  if (!instrument) {
    try {
      await loadInstrument();
    } catch (err) {
      console.error('Failed to load instrument:', err);
      return;
    }
  }

  // Use global sustain if duration is not provided
  const actualDuration = duration || globalSustain;

  // Play each note of the chord with slight timing variance for realism
  return Promise.all(notes.map((note, index) => {
    const midiNote = noteToMidi(note, octave);
    // Small delay between notes (20ms) for more natural sound
    const delay = index * 0.02;
    return instrument.play(midiNote, audioContext.currentTime + delay, {
      duration: actualDuration,
      gain: globalVolume * volumeBoost
    });
  }));
};

// Play a string (open string note)
export const playString = async (stringNote, duration = null) => {
  // Guitar strings are typically tuned to specific octaves
  const stringOctaves = {
    'E_low': 2, // Low E (6th string)
    'A': 2, // A (5th string)
    'D': 3, // D (4th string)
    'G': 3, // G (3rd string)
    'B': 3, // B (2nd string)
    'E_high': 4  // High E (1st string)
  };

  // Determine octave based on string note
  let octave;
  if (stringNote === 'E') {
    // Default to high E, caller should specify E_low if needed
    octave = 4;
  } else {
    octave = stringOctaves[stringNote] || 3;
  }

  // Use global sustain if duration is not provided
  const actualDuration = duration || globalSustain;

  return playNote(stringNote, actualDuration, octave);
};

// Play a fretted note
export const playFrettedNote = async (stringNote, fret, duration = null) => {
  if (!instrument) {
    try {
      await loadInstrument();
    } catch (err) {
      console.error('Failed to load instrument:', err);
      return;
    }
  }

  // Base octaves for standard guitar tuning
  const stringOctaves = {
    'E_low': 2, // Low E (6th string)
    'A': 2, // A (5th string)
    'D': 3, // D (4th string)
    'G': 3, // G (3rd string)
    'B': 3, // B (2nd string)
    'E_high': 4  // High E (1st string)
  };

  // Determine octave based on string note
  let octave;
  if (stringNote === 'E') {
    // Default to high E, caller should specify stringIndex if needed
    octave = 4;
  } else {
    octave = stringOctaves[stringNote] || 3;
  }

  // Calculate the resulting note
  const startNoteIndex = NOTES.indexOf(stringNote);
  const resultNoteIndex = (startNoteIndex + fret) % 12;
  const resultNote = NOTES[resultNoteIndex];

  // Calculate octave shift
  octave += Math.floor((startNoteIndex + fret) / 12);

  // Use global sustain if duration is not provided
  const actualDuration = duration || globalSustain;

  // Play the note directly with volume boost instead of using playNote
  const midiNote = noteToMidi(resultNote, octave);
  return instrument.play(midiNote, audioContext.currentTime, {
    duration: actualDuration,
    gain: globalVolume * volumeBoost // Apply both volume and boost for louder sound
  });
};

// Get current loaded instrument
export const getCurrentInstrument = () => {
  return instrument;
};

// Get audio context
export const getAudioContext = () => {
  return audioContext;
};
