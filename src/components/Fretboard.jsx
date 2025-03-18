import React, { useState, useEffect, useRef } from 'react';
import { NOTES, getScaleNotes, SCALE_LIBRARY, getScaleDegree } from '../utils/musicTheory';
import './Fretboard.css';
import './FretboardSection.css';
import PropTypes from 'prop-types';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';

const FretboardNote = ({ note, fret, isRoot, selectedScale, showScaleDegrees, rootNote, stringNote, onNoteTap, stringIndex }) => {
  const [isHovered, setIsHovered] = useState(false);
  const scaleNotes = selectedScale ? getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]) : [];
  const isInScale = scaleNotes.includes(note);
  const scaleDegree = isInScale ? getScaleDegree(note, rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]) : '';
  const [isPlaying, setIsPlaying] = useState(false);

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
    // Standard tuning octave mapping
    const baseOctaves = [2, 2, 3, 3, 3, 4]; // Low E to high E
    
    // Start with the base octave for this string
    let octave = baseOctaves[stringIndex];
    
    // Calculate note index changes
    const startNoteIndex = NOTES.indexOf(stringNote);
    
    // Calculate octave shifts based on fret position
    const octaveShift = Math.floor((startNoteIndex + fret) / 12);
    return octave + octaveShift;
  };

  const handleClick = () => {
    setIsPlaying(true);
    onNoteTap(note, getOctave());
    setTimeout(() => setIsPlaying(false), 300);
  };

  return (
    <div
      className={`fret ${fret === 0 ? 'first-fret' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isInScale && (
        <div 
          className={`note-marker ${getNoteType()} ${isPlaying ? 'playing' : ''}`}
          onClick={handleClick}
          title={`${note}${scaleDegree ? ` (${scaleDegree})` : ''}`}
        >
          {showScaleDegrees ? scaleDegree : note}
        </div>
      )}
      {isHovered && isInScale && (
        <div className="note-tooltip">
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
  onNoteTap: PropTypes.func.isRequired,
  stringIndex: PropTypes.number.isRequired
};

const StringLabel = ({ note, index, onClick }) => (
  <div 
    className="string-label" 
    onClick={() => onClick(note, index)}
    title={`${note} String`}
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const fretboardRef = useRef(null);
  const [showLegend, setShowLegend] = useState(true);
  const [showHints, setShowHints] = useState(false);

  // Initialize audio on component mount
  useEffect(() => {
    const initAudio = async () => {
      if (typeof window !== 'undefined') {
        try {
          await SoundfontAudio.initializeAudio();
          await SoundfontAudio.loadInstrument(selectedInstrument || 'acoustic_guitar_steel');
          SoundfontAudio.setVolumeBoost(1.5); // Set default volume boost
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

  // Scroll to show the first few frets initially
  useEffect(() => {
    if (fretboardRef.current) {
      fretboardRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  // Play open string
  const playOpenString = async (stringNote, index) => {
    if (!audioInitialized) return;
    
    try {
      // Standard tuning octave mapping
      const baseOctaves = [2, 2, 3, 3, 3, 4]; // Low E to high E
      const octave = baseOctaves[index];
      
      // Play the string
      await SoundfontAudio.playNote(stringNote, null, octave);
    } catch (error) {
      console.error('Error playing string:', error);
    }
  };

  // Handle note tap to play a note
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

  // Handle scroll buttons
  const scrollFretboard = (direction) => {
    if (fretboardRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      const newPosition = Math.max(0, scrollPosition + scrollAmount);
      setScrollPosition(newPosition);
    }
  };

  return (
    <div className="fretboard-section">
      <div className="fretboard-controls flex items-center justify-between mb-3">
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showScaleDegrees}
              onChange={(e) => setShowScaleDegrees(e.target.checked)}
              className="form-checkbox h-4 w-4"
            />
            <span>Show Scale Degrees</span>
          </label>
          
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showLegend ? 'Hide Legend' : 'Show Legend'}
          </button>
          
          <button
            onClick={() => setShowHints(!showHints)}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showHints ? 'Hide Hints' : 'Show Hints'}
          </button>
        </div>

        <div className="scroll-buttons flex space-x-2">
          <button 
            onClick={() => scrollFretboard('left')} 
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
            aria-label="Scroll left"
          >
            &lt;
          </button>
          <button 
            onClick={() => scrollFretboard('right')} 
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
            aria-label="Scroll right"
          >
            &gt;
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mb-3">Tap on notes to hear them</p>
      
      <div className="fretboard-container relative">
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
        <div className="fretboard-scroll" ref={fretboardRef}>
          <div className="fretboard">
            {tuning.map((string, stringIndex) => (
              <div key={stringIndex} className="string">
                {[...Array(fretCount + 1)].map((_, fret) => {
                  const noteIndex = (NOTES.indexOf(string) + fret) % 12;
                  const note = NOTES[noteIndex];
                  const isRoot = note === rootNote;
                  
                  // Draw fret markers only at specific frets, positioned between D and G strings
                  const isFretMarker = (
                    // Single dots at frets 3, 5, 7, 9, 15, 17, 19, 21
                    // Place them at D string (index 3) to position between D and G
                    (stringIndex === 3 && (fret === 3 || fret === 5 || 
                                          fret === 7 || fret === 9 || 
                                          fret === 15 || fret === 17 || 
                                          fret === 19 || fret === 21)) ||
                    // Double dot on 12th fret - one on B string (higher)
                    (stringIndex === 1 && fret === 12) ||
                    // Double dot on 12th fret - one on A string (lower)
                    (stringIndex === 4 && fret === 12)
                  );

                  return (
                    <div 
                      className={`fret ${fret === 0 ? 'first-fret' : ''}`}
                      key={`fret-${stringIndex}-${fret}`}
                    >
                      {isFretMarker && (
                        <div className="fret-marker"></div>
                      )}
                      <FretboardNote
                        key={fret}
                        note={note}
                        fret={fret}
                        isRoot={isRoot}
                        selectedScale={selectedScale}
                        showScaleDegrees={showScaleDegrees}
                        rootNote={rootNote}
                        stringNote={string}
                        stringIndex={stringIndex}
                        onNoteTap={handleNoteTap}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
            
            <div className="fret-numbers">
              {[...Array(fretCount + 1)].map((_, fret) => (
                <div 
                  key={fret} 
                  className={`fret-number ${fret === 0 ? "fret-number-nut" : ""}`}
                >
                  {fret}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showLegend && (
        <div className="scale-legend">
          <div className="legend-item">
            <div className="legend-color legend-root"></div>
            <span>Root Note</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-third"></div>
            <span>Third</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-fifth"></div>
            <span>Fifth</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-seventh"></div>
            <span>Seventh</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-scale"></div>
            <span>Other Scale Notes</span>
          </div>
        </div>
      )}
      
      {showHints && (
        <div className="fretboard-hints">
          <h4>Guitar Fretboard Tips</h4>
          <ul className="hint-list">
            <li>Click on any note to hear how it sounds</li>
            <li>Click on string labels on the left to play open strings</li>
            <li>Use the scroll buttons to navigate along the fretboard</li>
            <li>Enable &quot;Show Scale Degrees&quot; to see the position in the scale (I, II, III, etc.)</li>
            <li>Use the legend to understand the color coding of different scale positions</li>
          </ul>
        </div>
      )}
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