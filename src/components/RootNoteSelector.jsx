import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { NOTES } from '../utils/musicTheory';

const RootNoteSelector = memo(({ rootNote, setRootNote }) => {
  return (
    <div>
      <h3 id="root-note-label" className="block text-sm font-semibold text-slate-700 mb-2">Root Note</h3>
      <div
        role="group"
        aria-labelledby="root-note-label"
        className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2"
      >
        {NOTES.map(note => (
          <button
            key={note}
            onClick={() => setRootNote(note)}
            aria-pressed={rootNote === note}
            className={`
                px-2 py-2 rounded-lg text-sm font-bold transition-all duration-200 border
                ${rootNote === note
                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
              }
              `}
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  );
});

RootNoteSelector.displayName = 'RootNoteSelector';

RootNoteSelector.propTypes = {
  rootNote: PropTypes.string.isRequired,
  setRootNote: PropTypes.func.isRequired,
};

export default RootNoteSelector;
