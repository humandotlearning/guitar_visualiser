export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const STANDARD_TUNING = ['E', 'B', 'G', 'D', 'A', 'E'];


export const CHORDS = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
};

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

export const getScaleNotes = (root, scale) => {
  const rootIndex = NOTES.indexOf(root);
  return scale.map(interval => NOTES[(rootIndex + interval) % 12]);
};

export const getChordNotes = (root, chordType) => {
    const scaleType = chordType === 'major' ? 'Major Family' : 'Minor Family';
    const scaleName = chordType.charAt(0).toUpperCase() + chordType.slice(1);
    const scale = SCALE_LIBRARY[scaleType][scaleName];
  
    if (!scale) {
      console.error(`Invalid scale: ${scaleType} ${scaleName}`);
      return {};
    }
  
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
  

export const isNoteInScale = (note, scaleNotes) => {
  return scaleNotes.includes(note);
};

export const getScaleDegree = (note, rootNote, scale) => {
  const scaleNotes = getScaleNotes(rootNote, scale);
  const degree = scaleNotes.indexOf(note);
  if (degree === -1) return '';
  const degrees = ['1', '2', '3', '4', '5', '6', '7'];
  return degrees[degree];
};
