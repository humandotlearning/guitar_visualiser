// File: utils/musicTheory.js
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALE_LIBRARY = {
  'Major Family': {
    'Major': [0, 2, 4, 5, 7, 9, 11],
    'Lydian': [0, 2, 4, 6, 7, 9, 11],
    'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
  },
  'Minor Family': {
    'Natural Minor': [0, 2, 3, 5, 7, 8, 10],
    'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
    'Melodic Minor': [0, 2, 3, 5, 7, 9, 11],
    'Dorian': [0, 2, 3, 5, 7, 9, 10],
    'Phrygian': [0, 1, 3, 5, 7, 8, 10],
    'Locrian': [0, 1, 3, 5, 6, 8, 10],
  },
  'Pentatonic': {
    'Major Pentatonic': [0, 2, 4, 7, 9],
    'Minor Pentatonic': [0, 3, 5, 7, 10],
  },
  'Blues': {
    'Blues': [0, 3, 5, 6, 7, 10],
  },
};

export const CHORDS = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
};

// Get the note at a specific fret on a string
export const getNoteAtFret = (openStringNote, fret) => {
  const noteIndex = NOTES.indexOf(openStringNote);
  if (noteIndex === -1) return null;
  
  const newNoteIndex = (noteIndex + fret) % 12;
  return NOTES[newNoteIndex];
};

export const getScaleNotes = (root, scale) => {
  if (!root || !Array.isArray(scale)) return [];
  const rootIndex = NOTES.indexOf(root);
  return scale.map(interval => NOTES[(rootIndex + interval) % 12]);
};

export const getScalePattern = (scale) => {
  const pattern = [];
  for (let i = 1; i < scale.length; i++) {
    const interval = (scale[i] - scale[i - 1] + 12) % 12;
    if (interval === 1) pattern.push('H');
    else if (interval === 2) pattern.push('W');
    else if (interval === 3) pattern.push('W+H'); // for augmented second
  }
  return pattern.join(' ');
};

export const getChordNotes = (root, selectedScale) => {
  if (!root || !selectedScale) return {};
  const { category, name } = selectedScale;
  const scale = SCALE_LIBRARY[category][name];
  
  if (!scale) return {};

  const scaleNotes = getScaleNotes(root, scale);
  
  let chordDegrees;
  if (scale.length === 5) {
    chordDegrees = [0, 2, 4]; // Triads for pentatonic scales
  } else if (scale.length === 6) {
    chordDegrees = [0, 2, 4]; // Triads for hexatonic scales (can be adjusted if needed)
  } else if (scale.length === 7) {
    chordDegrees = [0, 2, 4]; // Triads for heptatonic scales
  } else {
    chordDegrees = [0, 2, 4]; // Default to triads if not explicitly handled
  }
  
  const chords = {};
  scale.forEach((_, index) => {
    const chordRoot = scaleNotes[index];
    chords[chordRoot] = chordDegrees.map(degree => scaleNotes[(index + degree) % scale.length]);
  });

  return chords;
};

export const CHORD_TYPES = {
  'Major Family': ['', 'm', 'm', '', '', 'm', 'dim'],
  'Minor Family': ['m', 'dim', '', 'm', 'm', '', ''],
  'Pentatonic': ['', 'm', 'm', '', 'm'],
  'Blues': ['7', 'm', 'm', '7', '7', 'm'],
};

export const getScaleDegree = (note, rootNote, scale) => {
    const scaleNotes = getScaleNotes(rootNote, scale);
    const degree = scaleNotes.indexOf(note);
    if (degree === -1) return '';
    const degrees = ['1', '2', '3', '4', '5', '6', '7'];
    return degrees[degree];
  };
  
  export const getNoteFrequency = (note) => {
    const A4 = 440;
    const A4Index = NOTES.indexOf('A');
    const noteIndex = NOTES.indexOf(note);
    const octave = 4; // Assuming middle octave
    const halfSteps = noteIndex - A4Index + (octave - 4) * 12;
    return A4 * Math.pow(2, halfSteps / 12);
  };
  
  export const getIntervalName = (semitones) => {
    const intervalNames = [
      'Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th',
      'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th'
    ];
    return intervalNames[semitones % 12];
  };
  
  export const getScaleFormula = (scale) => {
    return scale.map((interval, index) => {
      if (index === 0) return 'R';
      return getIntervalName(interval);
    }).join(' - ');
  };

  // export const getScaleNotes = (root, scale) => {
  //   const rootIndex = NOTES.indexOf(root);
  //   return scale.map(interval => NOTES[(rootIndex + interval) % 12]);
  // };