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
      <h3> {selectedScale.name} Scale Pattern  :  <b>{scalePattern}</b></h3>
      <br></br>
      <table className="table-auto">
        <thead>
          <tr>
          <th className="border p-2">Degree</th>
            {scaleNotes.map((note, index) => (
              <th key={index}>{index + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
          <td className="border p-2 font-medium"><b>Note</b></td>
            {scaleNotes.map((note, index) => (
              <td key={index}>{note}</td>
            ))}
          </tr>
        </tbody>
      </table><br/>
      <p className="text-sm text-gray-600">
        This table shows the notes of the {rootNote} {selectedScale.name} scale in order, 
        along with their scale degrees. The scale pattern represents the intervals between each note. 
      </p>
      <br/>
      <p className="text-sm text-gray-600">
        <b>W </b> refers to Whole Step.<br/>
        <b>H </b> refers to Half Step
      </p>
    </div>
  );
};

export default ScaleNotes;
