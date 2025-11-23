import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getCAGEDPositions } from '../../utils/musicTheory';
import { ChevronDown, Info } from 'lucide-react';

export default function CAGEDSystem({ rootNote, instrumentConfig }) {
  const [selectedShape, setSelectedShape] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  // CAGED system is only for string instruments (not keyboards)
  if (instrumentConfig?.type === 'keyboard') {
    return (
      <div className="caged-system-container">
        <h3 className="text-xl font-semibold mb-4">CAGED System</h3>
        <p className="text-gray-600">
          The CAGED system is designed for fretboard instruments like guitar and ukulele. It is
          not applicable to keyboard instruments.
        </p>
      </div>
    );
  }

  const positions = getCAGEDPositions(rootNote);

  // CAGED shape descriptions
  const shapeDescriptions = {
    'C Shape': {
      description: 'Based on the open C major chord shape. Common in lower positions.',
      image: 'C major shape - barre with 3rd finger across strings',
      color: 'bg-red-100 border-red-500 text-red-700',
      ringColor: 'ring-red-400',
    },
    'A Shape': {
      description: 'Based on the open A major chord shape. Very common for barre chords.',
      image: 'A major shape - barre with 1st finger',
      color: 'bg-orange-100 border-orange-500 text-orange-700',
      ringColor: 'ring-orange-400',
    },
    'G Shape': {
      description: 'Based on the open G major chord shape. Challenging but useful.',
      image: 'G major shape - requires stretching',
      color: 'bg-yellow-100 border-yellow-500 text-yellow-700',
      ringColor: 'ring-yellow-400',
    },
    'E Shape': {
      description: 'Based on the open E major chord shape. Most common barre chord.',
      image: 'E major shape - barre with 1st finger',
      color: 'bg-green-100 border-green-500 text-green-700',
      ringColor: 'ring-green-400',
    },
    'D Shape': {
      description: 'Based on the open D major chord shape. Higher on the neck.',
      image: 'D major shape - triangular fingering',
      color: 'bg-blue-100 border-blue-500 text-blue-700',
      ringColor: 'ring-blue-400',
    },
  };

  const selectedShapeInfo = selectedShape ? shapeDescriptions[selectedShape] : null;
  const selectedPosition = selectedShape ? positions[selectedShape] : null;

  return (
    <div className="caged-system-container bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          CAGED System: {rootNote} Major
        </h3>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium transition-colors"
        >
          <Info size={16} />
          {showInfo ? 'Hide Guide' : 'How it Works'}
        </button>
      </div>

      {showInfo && (
        <div className="mb-8 bg-indigo-50 rounded-lg p-5 text-sm text-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold text-indigo-900 mb-2">The Concept</h4>
              <p>
                Five movable chord shapes (C-A-G-E-D) cover the entire fretboard. They connect in sequence like puzzle pieces.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-indigo-900 mb-2">The Pattern</h4>
              <div className="flex items-center gap-1 font-mono text-xs bg-white/50 p-2 rounded w-fit">
                <span>C</span>→<span>A</span>→<span>G</span>→<span>E</span>→<span>D</span>→<span>C</span>...
              </div>
              <p className="mt-1">
                When you reach the 12th fret, the pattern repeats one octave higher.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-indigo-900 mb-2">Practice Tip</h4>
              <p>
                Learn each shape individually, then practice transitioning between them to play the same chord all over the neck.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CAGED shapes grid - Compact Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {Object.entries(positions).map(([shapeName, { fret, form }]) => {
          const shapeInfo = shapeDescriptions[shapeName];
          const isSelected = selectedShape === shapeName;

          return (
            <button
              key={shapeName}
              onClick={() => setSelectedShape(isSelected ? null : shapeName)}
              className={`
                relative p-3 rounded-lg border-2 text-left transition-all duration-200
                flex flex-col justify-between h-24
                ${isSelected
                  ? `${shapeInfo.color} ${shapeInfo.ringColor} ring-2 ring-offset-1 border-transparent`
                  : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                }
              `}
            >
              <div className="flex justify-between items-start w-full">
                <span className="font-bold text-lg">{form}</span>
                {isSelected && <ChevronDown size={16} className="opacity-50" />}
              </div>
              <div className="text-xs font-medium uppercase tracking-wider opacity-80">
                Fret {fret === 0 ? 'Open' : fret}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Shape Details Panel */}
      {selectedShape && selectedShapeInfo && selectedPosition && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-lg font-bold text-gray-900">{selectedShape}</h4>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${selectedShapeInfo.color}`}>
                  Fret {selectedPosition.fret === 0 ? 'Open' : selectedPosition.fret}
                </span>
              </div>
              <p className="text-gray-700 mb-4">{selectedShapeInfo.description}</p>

              <div className="bg-white p-3 rounded border border-gray-200 text-sm">
                <strong className="text-gray-900 block mb-1">Finger Placement:</strong>
                <span className="text-gray-600 italic">{selectedShapeInfo.image}</span>
              </div>
            </div>

            <div className="md:w-1/3 bg-blue-50/50 p-4 rounded border border-blue-100 text-sm">
              <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                💡 Quick Tip
              </h5>
              <p className="text-blue-800">
                Find the open <strong>{selectedPosition.form}</strong> chord shape and move it up to
                fret <strong>{selectedPosition.fret}</strong> to play a <strong>{rootNote} Major</strong> chord.
              </p>
            </div>
          </div>
        </div>
      )}

      {!selectedShape && (
        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
          Select a shape above to see details and fingering
        </div>
      )}
    </div>
  );
}

CAGEDSystem.propTypes = {
  rootNote: PropTypes.string.isRequired,
  instrumentConfig: PropTypes.shape({
    type: PropTypes.string,
    label: PropTypes.string.isRequired,
  }).isRequired,
};
