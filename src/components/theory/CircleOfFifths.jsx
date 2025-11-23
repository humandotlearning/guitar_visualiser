// File: components/theory/CircleOfFifths.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { getCircleOfFifths, getRelativeKey } from '../../utils/musicTheory';
import { calculateArc, getTextPosition } from '../../utils/theoryVisualizationUtils';

export default function CircleOfFifths({ rootNote, setRootNote, selectedScale }) {
  const circle = getCircleOfFifths('C'); // Always start from C
  const relativeKey = getRelativeKey(rootNote, selectedScale.category);

  const renderCircle = () => {
    return circle.map((note, i) => {
      const angle = (i * 30) - 90; // 30° per segment, start at top (C at 12 o'clock)
      const isActive = note === rootNote;
      const isRelative = note === relativeKey;

      // Calculate arc path
      const arcPath = calculateArc(angle, 30, 80, 180);

      // Calculate text position (middle of the arc)
      const textPos = getTextPosition(angle + 15, 130);

      // Get fill color based on state
      let fillColor = '#E5E7EB'; // default gray
      if (isActive) fillColor = '#4F46E5'; // indigo for active
      else if (isRelative) fillColor = '#10B981'; // green for relative

      return (
        <g key={note} onClick={() => setRootNote(note)} style={{ cursor: 'pointer' }}>
          {/* Pie slice */}
          <path
            d={arcPath}
            fill={fillColor}
            stroke="#FFFFFF"
            strokeWidth="2"
            className="transition-all duration-200 hover:opacity-80"
          />
          {/* Note label */}
          <text
            x={textPos.x}
            y={textPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-lg font-bold select-none"
            fill={isActive || isRelative ? '#FFFFFF' : '#1F2937'}
            style={{ pointerEvents: 'none' }}
          >
            {note}
          </text>
        </g>
      );
    });
  };

  // Inner circle labels (relative minors)
  const renderInnerCircle = () => {
    return circle.map((note, i) => {
      const angle = (i * 30) - 90;
      const minorKey = getRelativeKey(note, 'Major Family');
      const textPos = getTextPosition(angle + 15, 50);

      const isActive = minorKey === rootNote;

      return (
        <text
          key={`minor-${note}`}
          x={textPos.x}
          y={textPos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm select-none"
          fill={isActive ? '#4F46E5' : '#6B7280'}
          style={{ cursor: 'pointer' }}
          onClick={() => setRootNote(minorKey)}
        >
          {minorKey}m
        </text>
      );
    });
  };

  return (
    <div className="circle-of-fifths-container">
      <h3 className="text-xl font-semibold mb-4 text-center">Circle of Fifths</h3>

      <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto">
        {/* Outer circle (Major keys) */}
        {renderCircle()}

        {/* Inner circle (Relative minor keys) */}
        {renderInnerCircle()}

        {/* Center text - current key */}
        <text
          x="200"
          y="185"
          textAnchor="middle"
          className="text-2xl font-bold"
          fill="#1F2937"
        >
          {rootNote}
        </text>
        <text
          x="200"
          y="210"
          textAnchor="middle"
          className="text-base"
          fill="#6B7280"
        >
          {selectedScale.name}
        </text>
      </svg>

      {/* Legend */}
      <div className="legend mt-4 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-600 rounded"></div>
          <span>Current Key</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 rounded"></div>
          <span>Relative Key</span>
        </div>
      </div>

      {/* Information section */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
        <h4 className="font-semibold mb-2">How to use:</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Click any outer segment to change the root note (major keys)</li>
          <li>Click inner labels to select relative minor keys</li>
          <li>Moving clockwise increases by a perfect fifth (7 semitones)</li>
          <li>The relative minor key is 3 semitones below its major counterpart</li>
        </ul>
      </div>
    </div>
  );
}

CircleOfFifths.propTypes = {
  rootNote: PropTypes.string.isRequired,
  setRootNote: PropTypes.func.isRequired,
  selectedScale: PropTypes.shape({
    category: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};
