// File: components/ScaleNotes.jsx

import React from 'react';
import { getScaleNotes, getScalePattern, SCALE_LIBRARY } from '../utils/musicTheory';

const ScaleNotes = ({ rootNote, selectedScale }) => {
  if (!rootNote || !selectedScale) return null;

  const scaleNotes = getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]);
  const scalePattern = getScalePattern(SCALE_LIBRARY[selectedScale.category][selectedScale.name]);

  return (
    <div>
      <h2>Notes of {rootNote} {selectedScale.name} </h2>
      <h3> {selectedScale.name} Scale Interval  :  {scalePattern}</h3>
      <br></br>
      <table className="table-auto">
        <thead>
          <tr>
            {scaleNotes.map((note, index) => (
              <th key={index}>{index + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {scaleNotes.map((note, index) => (
              <td key={index}>{note}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ScaleNotes;
