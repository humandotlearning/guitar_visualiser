import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './components/ui/collapsible';

// Temporary placeholder components
const Select = ({ children, value, onValueChange }) => (
  <select value={value} onChange={e => onValueChange(e.target.value)}>{children}</select>
);
const SelectTrigger = ({ children }) => <div>{children}</div>;
const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;
const SelectContent = ({ children }) => <div>{children}</div>;
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;
const Checkbox = ({ checked, onCheckedChange, id }) => (
  <input type="checkbox" checked={checked} onChange={e => onCheckedChange(e.target.checked)} id={id} />
);
const Switch = ({ id, checked, onCheckedChange }) => (
  <input type="checkbox" id={id} checked={checked} onChange={e => onCheckedChange(e.target.checked)} />
);


// Constants
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const STANDARD_TUNING = ['E', 'B', 'G', 'D', 'A', 'E'];

// Scale colors (restored from original)
const SCALE_COLORS = [
  'rgba(255, 0, 0, 0.5)',   // Red
  'rgba(0, 255, 0, 0.5)',   // Green
  'rgba(0, 0, 255, 0.5)',   // Blue
  'rgba(255, 255, 0, 0.5)', // Yellow
  'rgba(255, 0, 255, 0.5)', // Magenta
  'rgba(0, 255, 255, 0.5)', // Cyan
];

// Grouped scale library
const SCALE_LIBRARY = {
  'Major Family': {
    'Major': [0, 2, 4, 5, 7, 9, 11],
    'Lydian': [0, 2, 4, 6, 7, 9, 11],
    'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
  },
  'Minor Family': {
    'Natural Minor': [0, 2, 3, 5, 7, 8, 10],
    'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
    'Melodic Minor': [0, 2, 3, 5, 7, 9, 11],
    'Dorian': [0, 2, 3, 5, 7, 9, 10],
    'Phrygian': [0, 1, 3, 5, 7, 8, 10],
    'Locrian': [0, 1, 3, 5, 6, 8, 10],
  },
  'Pentatonic': {
    'Major Pentatonic': [0, 2, 4, 7, 9],
    'Minor Pentatonic': [0, 3, 5, 7, 10],
  },
  'Blues': {
    'Blues': [0, 3, 5, 6, 7, 10],
  },
};

// Utility functions
const getScaleNotes = (root, scale) => {
  const rootIndex = NOTES.indexOf(root);
  return scale.map(interval => NOTES[(rootIndex + interval) % 12]);
};

const isNoteInScale = (note, scaleNotes) => {
  return scaleNotes.includes(note);
};

const getScaleDegree = (note, rootNote, scale) => {
  const scaleNotes = getScaleNotes(rootNote, scale);
  const degree = scaleNotes.indexOf(note);
  if (degree === -1) return '';
  const degrees = ['1', '2', '3', '4', '5', '6', '7'];
  return degrees[degree];
};

// Components
const FretboardNote = ({ note, fret, stringIndex, isRoot, selectedScales, showScaleDegrees, rootNote }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative border-r border-gray-300 ${fret === 0 ? 'border-l border-gray-800' : ''} 
        ${[3, 5, 7, 9, 15, 17, 19, 21].includes(fret) ? 'bg-gray-200' : ''}
        ${fret === 0 || fret === 12 ? 'bg-gray-300' : ''}`}
      style={{
        width: '40px',
        height: '40px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {selectedScales.map((scale, index) => {
        const scaleNotes = getScaleNotes(rootNote, SCALE_LIBRARY[scale.category][scale.name]);
        if (isNoteInScale(note, scaleNotes)) {
          const backgroundColor = SCALE_COLORS[index % SCALE_COLORS.length];
          return (
            <div
              key={index}
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isRoot ? 'ring-2 ring-black' : ''}`}
              style={{ backgroundColor }}
            >
              {showScaleDegrees
                ? getScaleDegree(note, rootNote, SCALE_LIBRARY[scale.category][scale.name])
                : note}
            </div>
          );
        }
        return null;
      })}
      {isHovered && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 px-2 py-1 rounded shadow z-10">
          {note}
        </div>
      )}
    </div>
  );
};

const FretboardString = ({ string, rootNote, selectedScales, showScaleDegrees }) => {
  return (
    <div className="flex items-center">
      <div className="w-8 text-center font-bold">{string}</div>
      {[...Array(24)].map((_, fret) => {
        const noteIndex = (NOTES.indexOf(string) + fret) % 12;
        const note = NOTES[noteIndex];
        const isRoot = note === rootNote;

        return (
          <FretboardNote
            key={fret}
            note={note}
            fret={fret}
            stringIndex={STANDARD_TUNING.indexOf(string)}
            isRoot={isRoot}
            selectedScales={selectedScales}
            showScaleDegrees={showScaleDegrees}
            rootNote={rootNote}
          />
        );
      })}
    </div>
  );
};

const Fretboard = ({ rootNote, selectedScales, showScaleDegrees }) => {
  return (
    <div className="flex flex-col min-w-max">
      {STANDARD_TUNING.map((string, index) => (
        <FretboardString
          key={index}
          string={string}
          rootNote={rootNote}
          selectedScales={selectedScales}
          showScaleDegrees={showScaleDegrees}
        />
      ))}
      <div className="flex mt-2">
        <div className="w-8"></div>
        {[...Array(24)].map((_, fret) => (
          <div key={fret} className="text-center" style={{ width: '40px' }}>
            {fret}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main component
const GuitarScaleVisualizer = () => {
  const [rootNote, setRootNote] = useState('C');
  const [selectedScales, setSelectedScales] = useState([]);
  const [showScaleDegrees, setShowScaleDegrees] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);

  const handleScaleToggle = (category, name) => {
    const scale = { category, name };
    setSelectedScales(prev => 
      prev.some(s => s.category === category && s.name === name)
        ? prev.filter(s => !(s.category === category && s.name === name))
        : [...prev, scale]
    );
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4">Enhanced Guitar Scale Visualizer</h2>
      
      <Collapsible open={isControlPanelOpen} onOpenChange={setIsControlPanelOpen}>
        <CollapsibleTrigger className="mb-2 px-4 py-2 bg-blue-500 text-white rounded">
          {isControlPanelOpen ? 'Hide Controls' : 'Show Controls'}
        </CollapsibleTrigger>
        <CollapsibleContent>
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-4">
            <Select value={rootNote} onValueChange={setRootNote}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Root Note" />
              </SelectTrigger>
              <SelectContent>
                {NOTES.map(note => (
                  <SelectItem key={note} value={note}>{note}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Switch
                id="scale-degrees"
                checked={showScaleDegrees}
                onCheckedChange={setShowScaleDegrees}
              />
              <label htmlFor="scale-degrees">Show Scale Degrees</label>
            </div>
          </div>
          
          {/* Scale selection */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(SCALE_LIBRARY).map(([category, scales]) => (
              <div key={category} className="mb-2">
                <h3 className="font-bold mb-1">{category}</h3>
                {Object.keys(scales).map((scale) => (
                  <div key={scale} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${category}-${scale}`}
                      checked={selectedScales.some(s => s.category === category && s.name === scale)}
                      onCheckedChange={() => handleScaleToggle(category, scale)}
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
        </CollapsibleContent>
      </Collapsible>
      
      {/* Fretboard */}
      <div className="overflow-x-auto">
        <Fretboard
          rootNote={rootNote}
          selectedScales={selectedScales}
          showScaleDegrees={showScaleDegrees}
        />
      </div>
    </div>
  );
};

export default GuitarScaleVisualizer;