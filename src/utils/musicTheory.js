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

export const getScaleNotes = (root, scale) => {
  if (!root || !scale) return [];
  const rootIndex = NOTES.indexOf(root);
  return scale.map(interval => NOTES[(rootIndex + interval) % 12]);
};

export const getChordNotes = (root, scaleType) => {
  if (!root || !scaleType) return {};
  const scaleFamily = scaleType === 'major' ? 'Major Family' : 'Minor Family';
  const scaleName = scaleType.charAt(0).toUpperCase() + scaleType.slice(1);
  const scale = SCALE_LIBRARY[scaleFamily][scaleName];
  
  if (!scale) return {};

  const scaleNotes = getScaleNotes(root, scale);
  return {
    I: [scaleNotes[0], scaleNotes[2], scaleNotes[4]],
    ii: [scaleNotes[1], scaleNotes[3], scaleNotes[5]],
    iii: [scaleNotes[2], scaleNotes[4], scaleNotes[6]],
    IV: [scaleNotes[3], scaleNotes[5], scaleNotes[0]],
    V: [scaleNotes[4], scaleNotes[6], scaleNotes[1]],
    vi: [scaleNotes[5], scaleNotes[0], scaleNotes[2]],
    vii: [scaleNotes[6], scaleNotes[1], scaleNotes[3]]
  };
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