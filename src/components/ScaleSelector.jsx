// File: src/components/ScaleSelector.jsx
import React from 'react';
import { NOTES, SCALE_LIBRARY } from '../utils/musicTheory';
import PropTypes from 'prop-types';

const ScaleSelector = ({ rootNote, setRootNote, selectedScale, setSelectedScale }) => {
  return (
    <div>
      <select
        value={rootNote}
        onChange={(e) => setRootNote(e.target.value)}
        className="w-32 mb-4 p-2 border rounded"
      >
        {NOTES.map(note => (
          <option key={note} value={note}>{note}</option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {Object.entries(SCALE_LIBRARY).map(([category, scales]) => (
          <div key={category}>
            <h3 className="font-bold mb-2">{category}</h3>
            {Object.keys(scales).map((scale) => (
              <div key={scale} className="flex items-center space-x-2 mb-1">
                <input
                  type="checkbox"
                  id={`${category}-${scale}`}
                  checked={selectedScale?.name === scale && selectedScale?.category === category}
                  onChange={() => setSelectedScale(
                    selectedScale?.name === scale && selectedScale?.category === category
                      ? null
                      : { category, name: scale }
                  )}
                />
                <label
                  htmlFor={`${category}-${scale}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {scale}
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

ScaleSelector.propTypes = {
  rootNote: PropTypes.string.isRequired,
  setRootNote: PropTypes.func.isRequired,
  selectedScale: PropTypes.shape({
    category: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  setSelectedScale: PropTypes.func.isRequired,

};

export default ScaleSelector;