import React from 'react';

const CHORDS = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
};

const getChordNotes = (root, chordType) => {
  const scaleNotes = getScaleNotes(root, SCALE_LIBRARY[chordType === 'major' ? 'Major Family' : 'Minor Family'][`${chordType.charAt(0).toUpperCase() + chordType.slice(1)}`]);
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

const ChordVisualizer = ({ rootNote, scaleType, onChordSelect }) => {
  const chords = CHORDS[scaleType];
  const chordNotes = getChordNotes(rootNote, scaleType);

  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold mb-2">Chords in the Scale</h3>
      <div className="flex flex-wrap gap-2">
        {chords.map((chord, index) => (
          <button
            key={chord}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => onChordSelect(chordNotes[chord.replace('°', '')])}
          >
            {chord}
          </button>
        ))}
      </div>
    </div>
  );
};

// In the main GuitarScaleVisualizer component:
const GuitarScaleVisualizer = () => {
  // ... existing state ...
  const [highlightedChord, setHighlightedChord] = useState([]);

  // ... existing code ...

  return (
    <div className="p-4 max-w-full mx-auto">
      {/* ... existing components ... */}
      <ChordVisualizer
        rootNote={rootNote}
        scaleType={selectedScales[0]?.name.toLowerCase().includes('minor') ? 'minor' : 'major'}
        onChordSelect={setHighlightedChord}
      />
      <div className="overflow-x-auto">
        <Fretboard
          rootNote={rootNote}
          selectedScales={selectedScales}
          showScaleDegrees={showScaleDegrees}
          highlightedChord={highlightedChord}
        />
      </div>
    </div>
  );
};

// Update the FretboardNote component to highlight chord tones:
const FretboardNote = ({ note, fret, stringIndex, isRoot, selectedScales, showScaleDegrees, rootNote, highlightedChord }) => {
  // ... existing code ...
  const isChordTone = highlightedChord.includes(note);
  
  return (
    <div
      // ... existing props ...
    >
      {/* ... existing rendered elements ... */}
      {isChordTone && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-yellow-400 rounded-full" />
      )}
    </div>
  );
};