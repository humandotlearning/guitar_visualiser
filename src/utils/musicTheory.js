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

  // ============ NEW MUSIC THEORY FUNCTIONS ============

  // Transpose a note by a given number of semitones
  export const transposeNote = (note, semitones) => {
    const noteIndex = NOTES.indexOf(note);
    if (noteIndex === -1) return null;
    return NOTES[(noteIndex + semitones + 12) % 12];
  };

  // Get the circle of fifths starting from a given note
  export const getCircleOfFifths = (startNote = 'C') => {
    const fifths = [];
    let current = startNote;
    for (let i = 0; i < 12; i++) {
      fifths.push(current);
      current = transposeNote(current, 7); // Perfect 5th = 7 semitones
    }
    return fifths;
  };

  // Get the relative key (major <-> minor)
  export const getRelativeKey = (rootNote, scaleCategory) => {
    // Major → Natural Minor (down 3 semitones)
    // Minor → Major (up 3 semitones)
    if (scaleCategory.includes('Major')) {
      return transposeNote(rootNote, -3);
    } else {
      return transposeNote(rootNote, 3);
    }
  };

  // Get the parallel key (same root, different mode)
  export const getParallelKey = (rootNote) => {
    return rootNote; // Same root note, different scale type
  };

  // Get common chord progressions
  export const getCommonProgressions = () => {
    return {
      'Pop Progression': { degrees: [0, 5, 3, 4], notation: 'I-vi-IV-V', description: 'Classic pop progression' },
      'Jazz ii-V-I': { degrees: [1, 4, 0], notation: 'ii-V-I', description: 'Essential jazz cadence' },
      'Blues 12-Bar': { degrees: [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 0], notation: 'I-I-I-I-IV-IV-I-I-V-IV-I-I', description: 'Traditional blues form' },
      'Andalusian': { degrees: [0, 6, 5, 4], notation: 'i-VII-VI-V', description: 'Flamenco/Spanish progression' },
      'Canon in D': { degrees: [0, 4, 5, 2, 3, 0, 3, 4], notation: 'I-V-vi-iii-IV-I-IV-V', description: 'Pachelbel\'s Canon' },
      'Circle Progression': { degrees: [0, 3, 6, 2, 5, 1, 4, 0], notation: 'I-IV-vii°-iii-vi-ii-V-I', description: 'Descending circle of fifths' },
    };
  };

  // Get harmonic function for a scale degree
  export const getHarmonicFunction = (scaleDegree, scaleCategory) => {
    const functions = {
      'Major Family': ['Tonic', 'Subdominant', 'Tonic', 'Subdominant', 'Dominant', 'Tonic', 'Dominant'],
      'Minor Family': ['Tonic', 'Subdominant', 'Tonic', 'Subdominant', 'Dominant', 'Tonic', 'Dominant'],
    };

    // Default to Major Family if not found
    const family = scaleCategory.includes('Major') ? 'Major Family' : 'Minor Family';
    return functions[family]?.[scaleDegree] || 'Unknown';
  };

  // Get diatonic chords for a scale (triads and 7ths)
  export const getDiatonicChords = (rootNote, scale, includeSevenths = true) => {
    const scaleNotes = getScaleNotes(rootNote, scale);
    const chords = scaleNotes.map((note, i) => {
      const third = scaleNotes[(i + 2) % scaleNotes.length];
      const fifth = scaleNotes[(i + 4) % scaleNotes.length];
      const triad = [note, third, fifth];

      if (includeSevenths && scaleNotes.length >= 7) {
        const seventh = scaleNotes[(i + 6) % scaleNotes.length];
        return {
          root: note,
          triad,
          seventh: [...triad, seventh],
          degree: i
        };
      }
      return {
        root: note,
        triad,
        degree: i
      };
    });
    return chords;
  };

  // Get interval between two notes
  export const getIntervalBetweenNotes = (note1, note2) => {
    const index1 = NOTES.indexOf(note1);
    const index2 = NOTES.indexOf(note2);
    if (index1 === -1 || index2 === -1) return null;

    const semitones = (index2 - index1 + 12) % 12;
    return {
      semitones,
      name: getIntervalName(semitones)
    };
  };

  // Get interval matrix from a root note
  export const getIntervalMatrix = (rootNote) => {
    const intervals = [
      { name: 'Unison (P1)', semitones: 0 },
      { name: 'Minor 2nd (m2)', semitones: 1 },
      { name: 'Major 2nd (M2)', semitones: 2 },
      { name: 'Minor 3rd (m3)', semitones: 3 },
      { name: 'Major 3rd (M3)', semitones: 4 },
      { name: 'Perfect 4th (P4)', semitones: 5 },
      { name: 'Tritone (TT)', semitones: 6 },
      { name: 'Perfect 5th (P5)', semitones: 7 },
      { name: 'Minor 6th (m6)', semitones: 8 },
      { name: 'Major 6th (M6)', semitones: 9 },
      { name: 'Minor 7th (m7)', semitones: 10 },
      { name: 'Major 7th (M7)', semitones: 11 },
    ];
    return intervals.map(interval => ({
      ...interval,
      note: transposeNote(rootNote, interval.semitones)
    }));
  };

  // Compare two scales and return differences
  export const compareScales = (rootNote, scale1, scale2) => {
    const notes1 = getScaleNotes(rootNote, scale1);
    const notes2 = getScaleNotes(rootNote, scale2);

    const onlyInScale1 = notes1.filter(note => !notes2.includes(note));
    const onlyInScale2 = notes2.filter(note => !notes1.includes(note));
    const common = notes1.filter(note => notes2.includes(note));

    return { onlyInScale1, onlyInScale2, common };
  };

  // Get voice leading between two chords
  export const getVoiceLeading = (chord1, chord2) => {
    return chord1.map((note, i) => {
      const targetNote = chord2[i] || chord2[0]; // Fallback to root if chord sizes differ
      const interval = getIntervalBetweenNotes(note, targetNote);
      return {
        from: note,
        to: targetNote,
        interval: interval?.semitones || 0,
        intervalName: interval?.name || 'Unison'
      };
    });
  };

  // CAGED System - Get chord positions for guitar
  export const getCAGEDPositions = (rootNote) => {
    const rootIndex = NOTES.indexOf(rootNote);

    // Starting fret positions for each CAGED shape (relative to C major)
    const CPosition = rootIndex; // C shape starts at the root

    return {
      'C Shape': { fret: (CPosition + 0) % 12, form: 'C', description: 'Barre at fret with C shape' },
      'A Shape': { fret: (CPosition + 3) % 12, form: 'A', description: 'Barre at fret with A shape' },
      'G Shape': { fret: (CPosition + 5) % 12, form: 'G', description: 'Barre at fret with G shape' },
      'E Shape': { fret: (CPosition + 8) % 12, form: 'E', description: 'Barre at fret with E shape' },
      'D Shape': { fret: (CPosition + 10) % 12, form: 'D', description: 'Barre at fret with D shape' },
    };
  };