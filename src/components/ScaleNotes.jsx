// ScaleNotes.jsx
import React from 'react';
import { getScaleNotes, SCALE_LIBRARY } from '../utils/musicTheory';

const ScaleNotes = ({ rootNote, selectedScale }) => {
  if (!selectedScale || !selectedScale.category || !selectedScale.name) {
    return <div className="card mt-4"><h2 className="text-xl font-semibold mb-2">Notes at Different Degrees</h2><p>No scale selected.</p></div>;
  }

  const scaleNotes = getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]);
  const degrees = ['1', '2', '3', '4', '5', '6', '7'];

  console.log('ScaleNotes Component - Root Note:', rootNote);
  console.log('ScaleNotes Component - Scale Notes:', scaleNotes);

  return (
    <div className="card mt-4">
      <h2 className="text-xl font-semibold mb-2">Notes of {rootNote} {selectedScale.name} </h2>
      <table className="table-auto w-full">
        <thead>
          <tr>
            {degrees.slice(0, scaleNotes.length).map((degree, index) => (
              <th key={index} className="px-4 py-2">{degree}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {scaleNotes.map((note, index) => (
              <td key={index} className="border px-4 py-2">{note}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ScaleNotes;
