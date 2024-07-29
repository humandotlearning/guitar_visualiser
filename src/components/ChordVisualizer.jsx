import React, { useEffect, useState } from 'react';
import { getChordNotes, CHORD_TYPES, SCALE_LIBRARY, getScaleNotes } from '../utils/musicTheory';

const ChordVisualizer = ({ rootNote, selectedScale, onChordSelect }) => {
  const [chords, setChords] = useState({});

  useEffect(() => {
    if (rootNote && selectedScale) {
      const chordNotes = getChordNotes(rootNote, selectedScale);
      setChords(chordNotes);
    }
  }, [rootNote, selectedScale]);

  if (!rootNote || !selectedScale) {
    return <div className="card mt-4"><h2 className="text-xl font-semibold mb-2">Chords in the Scale</h2><p>Please select a scale.</p></div>;
  }

  const { category, name } = selectedScale;
  const scaleChords = SCALE_LIBRARY[category][name];
  const chordTypes = CHORD_TYPES[category];
  const scaleNotes = getScaleNotes(rootNote, scaleChords);

  return (
    <div className="card mt-4">
      <h2 className="text-xl font-semibold mb-2">Chords in the Scale</h2>
      <table className="table-auto w-full">
        <thead>
          <tr>
            {scaleNotes.map((note, index) => (
              <th key={index} className="px-4 py-2">{note}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {Object.keys(chords).map((chordRoot, index) => (
              <td key={index} className="border px-4 py-2">
                <button onClick={() => onChordSelect(chords[chordRoot])}>
                  {chordRoot}{chordTypes[index]}
                </button>
                <div className="chord-notes">
                  {chords[chordRoot].join(', ')}
                </div>
                <div className="chord-degree">
                  {index + 1} {chordTypes[index]}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ChordVisualizer;
