// File: components/Fretboard.jsx
import React, { useState } from 'react';
import { NOTES, getScaleNotes, SCALE_LIBRARY, getScaleDegree } from '../utils/musicTheory';

const FretboardNote = ({ note, fret, stringIndex, isRoot, selectedScale, showScaleDegrees, rootNote }) => {
  const [isHovered, setIsHovered] = useState(false);
  const scaleNotes = selectedScale ? getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]) : [];
  const isInScale = scaleNotes.includes(note);
  const scaleDegree = isInScale ? getScaleDegree(note, rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]) : '';

  return (
    <div
      className={`relative border-r border-gray-300 ${fret === 0 ? 'border-l border-gray-800' : ''} 
        ${[3, 5, 7, 9, 15, 17, 19, 21].includes(fret) ? 'bg-gray-200' : ''} 
        ${fret === 0 || fret === 12 ? 'bg-gray-300' : ''}`}
      style={{ width: '40px', height: '40px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isInScale && (
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isRoot ? 'ring-2 ring-black' : ''}`}
          style={{ backgroundColor: isRoot ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 159, 100, 0.7)' }}
        >
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
        <div className="string-labels">
          {tuning.map((string, index) => (
            <div key={index} className="string-label">{string}</div>
          ))}
        </div>
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
                      stringIndex={tuning.indexOf(string)}
                      isRoot={isRoot}
                      selectedScale={selectedScale}
                      showScaleDegrees={showScaleDegrees}
                      rootNote={rootNote}
                    />
                  );
                })}
              </div>
            ))}
            <div className="flex mt-2 fret-numbers">
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