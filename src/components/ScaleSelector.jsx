// File: src/components/ScaleSelector.jsx
import React from 'react';
import { NOTES, SCALE_LIBRARY } from '../utils/musicTheory';
import PropTypes from 'prop-types';

const ScaleSelector = ({ rootNote, setRootNote, selectedScale, setSelectedScale }) => {
  const [activeCategory, setActiveCategory] = React.useState(Object.keys(SCALE_LIBRARY)[0]);

  return (
    <div className="space-y-6">
      {/* Root Note Selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Root Note</label>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
          {NOTES.map(note => (
            <button
              key={note}
              onClick={() => setRootNote(note)}
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

      {/* Scale Categories Tabs */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Scale Type</label>
        <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-200 pb-2">
          {Object.keys(SCALE_LIBRARY).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeCategory === category
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Scales in Active Category */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[120px]">
          <div className="flex flex-wrap gap-2">
            {Object.keys(SCALE_LIBRARY[activeCategory]).map((scale) => {
              const isSelected = selectedScale?.name === scale && selectedScale?.category === activeCategory;
              return (
                <button
                  key={scale}
                  onClick={() => setSelectedScale(
                    isSelected ? null : { category: activeCategory, name: scale }
                  )}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border
                    ${isSelected
                      ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm ring-1 ring-blue-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                    }
                  `}
                >
                  {scale}
                </button>
              );
            })}
          </div>
        </div>
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