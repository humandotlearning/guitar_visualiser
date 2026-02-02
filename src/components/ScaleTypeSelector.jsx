import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { SCALE_LIBRARY } from '../utils/musicTheory';

const ScaleTypeSelector = memo(({ selectedScale, setSelectedScale }) => {
  const [activeCategory, setActiveCategory] = useState(Object.keys(SCALE_LIBRARY)[0]);

  return (
    <div>
      <h3 id="scale-type-label" className="block text-sm font-semibold text-slate-700 mb-2">Scale Type</h3>
      <div
        role="tablist"
        aria-labelledby="scale-type-label"
        className="flex flex-wrap gap-2 mb-4 border-b border-slate-200 pb-2"
      >
        {Object.keys(SCALE_LIBRARY).map((category) => (
          <button
            key={category}
            id={`tab-${category}`}
            role="tab"
            aria-selected={activeCategory === category}
            aria-controls="scale-panel"
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
      <div
        id="scale-panel"
        role="tabpanel"
        aria-labelledby={`tab-${activeCategory}`}
        className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[120px]"
      >
        <div className="flex flex-wrap gap-2">
          {Object.keys(SCALE_LIBRARY[activeCategory]).map((scale) => {
            const isSelected = selectedScale?.name === scale && selectedScale?.category === activeCategory;
            return (
              <button
                key={scale}
                aria-pressed={isSelected}
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
  );
});

ScaleTypeSelector.displayName = 'ScaleTypeSelector';

ScaleTypeSelector.propTypes = {
  selectedScale: PropTypes.shape({
    category: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  setSelectedScale: PropTypes.func.isRequired,
};

export default ScaleTypeSelector;
