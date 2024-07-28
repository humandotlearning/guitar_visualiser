// File: src/components/ChordVisualizer.jsx
import React from 'react';
import { getChordNotes } from '../utils/musicTheory';

const CHORDS = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
};

const ChordVisualizer = ({ rootNote, scaleType }) => {
  if (!rootNote || !scaleType) {
    return <div>Please select a root note and scale type.</div>;
  }

  const chords = CHORDS[scaleType] || [];
  const chordNotes = getChordNotes(rootNote, scaleType);

  if (Object.keys(chordNotes).length === 0) {
    return <div>Unable to generate chord notes for the selected scale.</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {chords.map((chord) => (
        <div key={chord} className="flex flex-col items-center">
          <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2">
            {chord}
          </button>
          <div>{chordNotes[chord.replace('°', '')]?.join(', ') || 'N/A'}</div>
        </div>
      ))}
    </div>
  );
};

export default ChordVisualizer;