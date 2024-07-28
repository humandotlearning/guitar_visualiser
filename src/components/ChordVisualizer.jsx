// File: src/components/ChordVisualizer.jsx
import React from 'react';
import { getChordNotes, CHORD_TYPES, NOTES } from '../utils/musicTheory';

const ChordVisualizer = ({ rootNote, selectedScale, onChordSelect }) => {
  if (!rootNote || !selectedScale) {
    return <div>Please select a root note and scale type.</div>;
  }

  const chordNotes = getChordNotes(rootNote, selectedScale);
  const chordTypes = CHORD_TYPES[selectedScale.category] || [];

  if (Object.keys(chordNotes).length === 0) {
    return <div>Unable to generate chord notes for the selected scale.</div>;
  }

  // Find the index of the root note in the NOTES array
  const rootIndex = NOTES.indexOf(rootNote);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Object.entries(chordNotes).map(([chordRoot, notes], index) => {
        // Calculate the correct index for chord types
        const chordTypeIndex = (NOTES.indexOf(chordRoot) - rootIndex + 12) % 12;
        const chordType = chordTypes[chordTypeIndex] || '';

        return (
          <div key={chordRoot} className="flex flex-col items-center">
            <button 
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
              onClick={() => onChordSelect(notes)}
            >
              {chordRoot}{chordType}
            </button>
            <div>{notes.join(', ')}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ChordVisualizer;