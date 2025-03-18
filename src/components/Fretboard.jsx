import React, { useState, useEffect } from 'react';
import { NOTES, getScaleNotes, SCALE_LIBRARY, getScaleDegree } from '../utils/musicTheory';
import './Fretboard.css';
import PropTypes from 'prop-types';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';

const FretboardNote = ({ note, fret, isRoot, selectedScale, showScaleDegrees, rootNote, stringNote, onNoteTap }) => {
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

  // Calculate appropriate octave based on string and fret
  const getOctave = () => {
    // Get proper octave based on guitar string
    let octave;
    if (stringNote === 'E') {
      // Determine if it's the low E or high E based on fret position
      octave = fret < 7 ? 2 : 4; // Assuming low E for simplicity
    } else if (stringNote === 'A') {
      octave = 2;
    } else if (stringNote === 'D' || stringNote === 'G' || stringNote === 'B') {
      octave = 3;
    } else {
      octave = 3; // Default
    }
    
    const startNoteIndex = NOTES.indexOf(stringNote);
    octave += Math.floor((startNoteIndex + fret) / 12);
    return octave;
  };

  return (
    <div
      className={`fret ${fret === 0 ? 'first-fret' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isInScale && (
        <div 
          className={`note-marker ${getNoteType()}`}
          onClick={() => onNoteTap(note, getOctave())}
          style={{ cursor: 'pointer' }}
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

FretboardNote.propTypes = {
  note: PropTypes.string.isRequired,
  fret: PropTypes.number.isRequired,
  isRoot: PropTypes.bool.isRequired,
  selectedScale: PropTypes.shape({
    category: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  showScaleDegrees: PropTypes.bool.isRequired,
  rootNote: PropTypes.string.isRequired,
  stringNote: PropTypes.string.isRequired,
  onNoteTap: PropTypes.func.isRequired
};

const StringLabel = ({ note, index, onClick }) => (
  <div 
    className="string-label" 
    onClick={() => onClick(note, index)}
    style={{ cursor: 'pointer' }}
  >
    {note}
  </div>
);

StringLabel.propTypes = {
  note: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired
};

const Fretboard = ({ rootNote, selectedScale, showScaleDegrees, setShowScaleDegrees, tuning, fretCount, selectedInstrument }) => {
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize audio on component mount
  useEffect(() => {
    const initAudio = async () => {
      if (typeof window !== 'undefined') {
        try {
          await SoundfontAudio.initializeAudio();
          await SoundfontAudio.loadInstrument(selectedInstrument || 'acoustic_guitar_steel');
          setAudioInitialized(true);
        } catch (error) {
          console.error('Error initializing audio:', error);
        }
      }
    };

    initAudio();

  }, [selectedInstrument]);

  // Handle instrument changes
  useEffect(() => {
    if (audioInitialized && selectedInstrument) {
      const loadNewInstrument = async () => {
        try {
          await SoundfontAudio.loadInstrument(selectedInstrument);
        } catch (error) {
          console.error('Error loading instrument:', error);
        }
      };
      loadNewInstrument();
    }
  }, [selectedInstrument, audioInitialized]);

  // Play open string
  const playOpenString = async (stringNote, index) => {
    if (!audioInitialized) return;
    
    try {
      // Get correct octave based on guitar string
      let octave;
      if (stringNote === 'E') {
        // Determine if it's the low E or high E based on index
        octave = index === 5 ? 2 : 4;
      } else if (stringNote === 'A') {
        octave = 2;
      } else if (stringNote === 'D' || stringNote === 'G' || stringNote === 'B') {
        octave = 3;
      } else {
        octave = 3; // Default
      }
      
      // Play the string
      await SoundfontAudio.playNote(stringNote, null, octave);
    } catch (error) {
      console.error('Error playing string:', error);
    }
  };

  // Handle note tap with double-tap detection to play a note
  const handleNoteTap = (note, octave) => {
    if (audioInitialized && !isPlaying) {
      setIsPlaying(true);
      SoundfontAudio.playNote(note, null, octave)
        .then(() => setTimeout(() => setIsPlaying(false), 300))
        .catch(error => {
          console.error('Error playing note:', error);
          setIsPlaying(false);
        });
    }
  };

  return (
    <div>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={showScaleDegrees}
          onChange={(e) => setShowScaleDegrees(e.target.checked)}
          className="form-checkbox h-4 w-4"
        />
        <span>Show Scale Degrees</span>
      </label>
      <p className="text-sm text-gray-500 mt-2">Tap on notes to hear them</p>
      <br />
      <div className="fretboard-container">
        <div className="string-labels">
          {tuning.map((string, index) => (
            <StringLabel 
              key={index} 
              note={string} 
              index={index} 
              onClick={playOpenString} 
            />
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
                      isRoot={isRoot}
                      selectedScale={selectedScale}
                      showScaleDegrees={showScaleDegrees}
                      rootNote={rootNote}
                      stringNote={string}
                      onNoteTap={handleNoteTap}
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

Fretboard.propTypes = {
  rootNote: PropTypes.string.isRequired,
  selectedScale: PropTypes.shape({
    category: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  showScaleDegrees: PropTypes.bool.isRequired,
  setShowScaleDegrees: PropTypes.func.isRequired,
  tuning: PropTypes.arrayOf(PropTypes.string).isRequired,
  fretCount: PropTypes.number.isRequired,
  selectedInstrument: PropTypes.string,
};

export default Fretboard;