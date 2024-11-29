// File: components/Fretboard.jsx
import React, { useState } from 'react';
import { NOTES, getScaleNotes, SCALE_LIBRARY, getScaleDegree } from '../utils/musicTheory';
import './Fretboard.css';

const FretboardNote = ({ note, fret, stringIndex, isRoot, selectedScale, showScaleDegrees, rootNote }) => {
  const [isHovered, setIsHovered] = useState(false);
  const scaleNotes = selectedScale ? getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]) : [];
  const isInScale = scaleNotes.includes(note);
  const scaleDegree = isInScale ? getScaleDegree(note, rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]) : '';

  // Determine note type for coloring
  const getNoteType = () => {
    if (!isInScale) return '';
    if (isRoot) return 'root';
    const interval = scaleNotes.indexOf(note);
    switch(interval) {
      case 2: return 'third';
      case 4: return 'fifth';
      case 6: return 'seventh';
      default: return 'scale-note';
    }
  };

  return (
    <div
      className={`fret ${fret === 0 ? 'first-fret' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isInScale && (
        <div className={`note-marker ${getNoteType()}`}>
          {showScaleDegrees ? scaleDegree : note}
        </div>
      )}
      {isHovered && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 px-2 py-1 rounded shadow z-10">
          {note} {scaleDegree && `(${scaleDegree})`}
        </div>
      )}
    </div>
  );
};

const Fretboard = ({ rootNote, selectedScale, showScaleDegrees, setShowScaleDegrees, tuning, fretCount }) => {
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={showScaleDegrees}
          onChange={(e) => setShowScaleDegrees(e.target.checked)}
        />
        <span>  </span>Show Scale Degrees
      </label>
      <br />
      <br />
      <div className="fretboard-container">
        {/* <div className="string-labels">
          {tuning.map((string, index) => (
            <div key={index} className="string-label">{string}</div>
          ))}
        </div> */}
        <div className="fretboard-scroll">
          <div className="fretboard">
            {tuning.map((string, index) => (
              <div key={index} className="string">
                {[...Array(fretCount + 1)].map((_, fret) => {
                  const noteIndex = (NOTES.indexOf(string) + fret) % 12;
                  const note = NOTES[noteIndex];
                  const isRoot = note === rootNote;

                  return (
                    <FretboardNote
                      key={fret}
                      note={note}
                      fret={fret}
                      stringIndex={index}
                      isRoot={isRoot}
                      selectedScale={selectedScale}
                      showScaleDegrees={showScaleDegrees}
                      rootNote={rootNote}
                    />
                  );
                })}
              </div>
            ))}
          <div className="fret-numbers">
            {[...Array(fretCount + 1)].map((_, fret) => (
              <div key={fret} className="fret-number">
                {fret}
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fretboard;