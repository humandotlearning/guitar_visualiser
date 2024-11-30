// File: components/ScaleNotes.jsx

import React from 'react';
import { getScaleNotes, getScalePattern, SCALE_LIBRARY } from '../utils/musicTheory';
import PropTypes from 'prop-types';

const ScaleNotes = ({ rootNote, selectedScale }) => {
  if (!rootNote || !selectedScale) return null;

  const scaleNotes = getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]);
  const scalePattern = getScalePattern(SCALE_LIBRARY[selectedScale.category][selectedScale.name]);

  // Helper function to get color based on scale degree
  const getScaleDegreeColor = (index) => {
    switch (index) {
      case 0: return 'var(--color-tonic)';      // Tonic (I)
      case 1: return 'var(--color-major)';      // Major Step (II)
      case 2: return 'var(--color-minor)';      // Minor Step (III)
      case 3: return 'var(--color-perfect)';    // Perfect Fourth (IV)
      case 4: return 'var(--color-perfect)';    // Perfect Fifth (V)
      case 5: return 'var(--color-major)';      // Major Step (VI)
      case 6: return 'var(--color-minor)';      // Minor Step (VII)
      default: return 'black';
    }
  };

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
              <th key={index} style={{ color: getScaleDegreeColor(index) }}>{index + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2 font-medium"><b>Note</b></td>
            {scaleNotes.map((note, index) => (
              <td key={index} style={{ 
                color: getScaleDegreeColor(index),
                fontWeight: 'bold'
              }}>{note}</td>
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

ScaleNotes.propTypes = {
  rootNote: PropTypes.string.isRequired,
  selectedScale: PropTypes.shape({
    category: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default ScaleNotes;
