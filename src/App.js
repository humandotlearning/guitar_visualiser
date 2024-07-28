import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Checkbox } from './components/ui/checkbox';
import { Switch } from './components/ui/switch';

// ... (rest of the code from the artifact)
// Constants
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const STANDARD_TUNING = ['E', 'B', 'G', 'D', 'A', 'E'];
const SCALE_COLORS = [
  'rgba(255, 0, 0, 0.5)',   // Red
  'rgba(0, 255, 0, 0.5)',   // Green
  'rgba(0, 0, 255, 0.5)',   // Blue
  'rgba(255, 255, 0, 0.5)', // Yellow
  'rgba(255, 0, 255, 0.5)', // Magenta
  'rgba(0, 255, 255, 0.5)', // Cyan
];

const SCALE_LIBRARY = {
  'Major': [0, 2, 4, 5, 7, 9, 11],
  'Natural Minor': [0, 2, 3, 5, 7, 8, 10],
  'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
  'Melodic Minor': [0, 2, 3, 5, 7, 9, 11],
  'Dorian Mode': [0, 2, 3, 5, 7, 9, 10],
  'Phrygian Mode': [0, 1, 3, 5, 7, 8, 10],
  'Lydian Mode': [0, 2, 4, 6, 7, 9, 11],
  'Mixolydian Mode': [0, 2, 4, 5, 7, 9, 10],
  'Locrian Mode': [0, 1, 3, 5, 6, 8, 10],
  'Pentatonic Major': [0, 2, 4, 7, 9],
  'Pentatonic Minor': [0, 3, 5, 7, 10],
  'Blues': [0, 3, 5, 6, 7, 10],
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
  const scaleNotes = getScaleNotes(rootNote, SCALE_LIBRARY[scale]);
  const degree = scaleNotes.indexOf(note);
  if (degree === -1) return '';
  const degrees = ['1', '2', '3', '4', '5', '6', '7'];
  return degrees[degree];
};

// Components
const FretboardNote = ({ note, fret, stringIndex, isRoot, backgroundColor, showScaleDegrees, rootNote, selectedScale }) => {
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
      {backgroundColor !== 'transparent' && (
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isRoot ? 'ring-2 ring-black' : ''}`}
          style={{ backgroundColor }}
        >
          {showScaleDegrees
            ? getScaleDegree(note, rootNote, selectedScale)
            : note}
        </div>
      )}
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
        const backgroundColor = selectedScales.some(scale => 
          isNoteInScale(note, getScaleNotes(rootNote, SCALE_LIBRARY[scale]))
        ) ? SCALE_COLORS[selectedScales.indexOf(selectedScales.find(scale => 
          isNoteInScale(note, getScaleNotes(rootNote, SCALE_LIBRARY[scale]))
        )) % SCALE_COLORS.length] : 'transparent';
        const isRoot = note === rootNote;

        return (
          <FretboardNote
            key={fret}
            note={note}
            fret={fret}
            isRoot={isRoot}
            backgroundColor={backgroundColor}
            showScaleDegrees={showScaleDegrees}
            rootNote={rootNote}
            selectedScale={selectedScales[0]}
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

  return (
    <div className="p-4 max-w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4">Enhanced Guitar Scale Visualizer</h2>
      
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
        {Object.keys(SCALE_LIBRARY).map((scale) => (
          <div key={scale} className="flex items-center space-x-2">
            <Checkbox
              id={scale}
              checked={selectedScales.includes(scale)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedScales([...selectedScales, scale]);
                } else {
                  setSelectedScales(selectedScales.filter(s => s !== scale));
                }
              }}
            />
            <label
              htmlFor={scale}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {scale}
            </label>
          </div>
        ))}
      </div>
      
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