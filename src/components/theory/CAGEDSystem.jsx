// File: components/theory/CAGEDSystem.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getCAGEDPositions, NOTES } from '../../utils/musicTheory';

export default function CAGEDSystem({ rootNote, instrumentConfig }) {
  const [selectedShape, setSelectedShape] = useState(null);

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
    },
    'A Shape': {
      description: 'Based on the open A major chord shape. Very common for barre chords.',
      image: 'A major shape - barre with 1st finger',
      color: 'bg-orange-100 border-orange-500 text-orange-700',
    },
    'G Shape': {
      description: 'Based on the open G major chord shape. Challenging but useful.',
      image: 'G major shape - requires stretching',
      color: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    },
    'E Shape': {
      description: 'Based on the open E major chord shape. Most common barre chord.',
      image: 'E major shape - barre with 1st finger',
      color: 'bg-green-100 border-green-500 text-green-700',
    },
    'D Shape': {
      description: 'Based on the open D major chord shape. Higher on the neck.',
      image: 'D major shape - triangular fingering',
      color: 'bg-blue-100 border-blue-500 text-blue-700',
    },
  };

  return (
    <div className="caged-system-container">
      <h3 className="text-xl font-semibold mb-4">
        CAGED System for {rootNote} Major on {instrumentConfig.label}
      </h3>

      <p className="text-sm text-gray-600 mb-6">
        The CAGED system shows five movable chord shapes that cover the entire fretboard. Each
        shape connects to the next, allowing you to play the same chord in different positions.
        Click a shape to learn more.
      </p>

      {/* Visual representation of the CAGED sequence */}
      <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
        <h4 className="font-semibold mb-3 text-center">CAGED Sequence (Repeating Pattern):</h4>
        <div className="flex justify-center items-center gap-2 text-lg font-bold flex-wrap">
          {['C', 'A', 'G', 'E', 'D', 'C', 'A', 'G', 'E', 'D'].map((shape, i) => (
            <React.Fragment key={i}>
              <span
                className={`px-3 py-2 rounded ${
                  selectedShape === `${shape} Shape`
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700'
                }`}
              >
                {shape}
              </span>
              {i < 9 && <span className="text-gray-400">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* CAGED shapes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(positions).map(([shapeName, { fret, form }]) => {
          const shapeInfo = shapeDescriptions[shapeName];
          const isSelected = selectedShape === shapeName;

          return (
            <div
              key={shapeName}
              onClick={() => setSelectedShape(isSelected ? null : shapeName)}
              className={`shape-card border-l-4 ${shapeInfo.color.split(' ')[1]} p-4 rounded-r-lg cursor-pointer transition-all ${
                isSelected ? 'bg-indigo-50 shadow-lg scale-105' : 'bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-bold">{form} Shape</h4>
                <div className="text-2xl font-bold text-indigo-600">
                  Fret {fret === 0 ? 'Open' : fret}
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-2">{shapeInfo.description}</p>

              {isSelected && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 italic">{shapeInfo.image}</p>
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <strong>Practice tip:</strong> Find the open {form} chord shape and move it to
                    fret {fret} to play {rootNote} major.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Educational content */}
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <h4 className="font-semibold text-blue-900 mb-2">🎸 How the CAGED System Works:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
            <li>
              Each letter (C-A-G-E-D) represents a basic open chord shape that can be moved up the
              fretboard
            </li>
            <li>
              These five shapes connect in sequence, covering the entire neck with overlapping
              patterns
            </li>
            <li>When you reach the 12th fret, the pattern repeats one octave higher</li>
            <li>The same system works for major scales, arpeggios, and chord variations</li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
          <h4 className="font-semibold text-green-900 mb-2">💡 Practice Strategies:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-green-800">
            <li>
              <strong>Learn each shape:</strong> Practice the open C, A, G, E, and D chord shapes
            </li>
            <li>
              <strong>Move them up:</strong> Take each shape and slide it up the neck to form
              different chords
            </li>
            <li>
              <strong>Connect shapes:</strong> Practice transitioning from one CAGED shape to the
              next for the same chord
            </li>
            <li>
              <strong>Find the root:</strong> Identify where the root note ({rootNote}) appears in
              each shape
            </li>
            <li>
              <strong>Apply to scales:</strong> Use CAGED shapes as a framework for learning scale
              positions
            </li>
          </ol>
        </div>

        <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
          <h4 className="font-semibold text-purple-900 mb-2">🎯 Quick Reference:</h4>
          <div className="text-sm text-purple-800">
            <p className="mb-2">
              To play <strong>{rootNote} major</strong> anywhere on the neck, use these shapes at
              these frets:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(positions).map(([shapeName, { fret, form }]) => (
                <div key={shapeName} className="bg-white p-2 rounded text-center">
                  <div className="font-bold text-purple-900">{form}</div>
                  <div className="text-xs text-gray-600">
                    Fret {fret === 0 ? 'Open' : fret}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive root note selector */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-3">Try a different root note:</h4>
        <div className="flex flex-wrap gap-2">
          {NOTES.map((note) => (
            <button
              key={note}
              onClick={() => {
                // This would need to be connected to the parent component's setRootNote
                // For now, it just shows the UI
              }}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                note === rootNote
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {note}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Note: To change the root note, use the main scale selector at the top of the page.
        </p>
      </div>
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
