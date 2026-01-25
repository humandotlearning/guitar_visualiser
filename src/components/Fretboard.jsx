import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { NOTES, getScaleNotes, SCALE_LIBRARY, getScaleDegreeFromNotes } from '../utils/musicTheory';
import './Fretboard.css';
import './FretboardSection.css';
import './PrintStyles.css'; // Import print styles
import PropTypes from 'prop-types';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';

// Optimized FretboardNote component using React.memo
const FretboardNote = React.memo(({
  note,
  fret,
  isRoot,
  scaleNotes,
  showScaleDegrees,
  stringNote,
  onNoteTap,
  stringIndex,
  showNonScaleNotes,
  octaves,
  selectedScale
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Calculate degree index once.
  // scaleNotes is memoized in parent, so this is fast.
  const degreeIndex = useMemo(() => scaleNotes.indexOf(note), [scaleNotes, note]);

  // Check if in scale based on index
  const isInScale = degreeIndex !== -1;

  // Only calculate degree if needed and note is in scale
  const scaleDegree = useMemo(() => {
    return isInScale && selectedScale
      ? getScaleDegreeFromNotes(note, scaleNotes)
      : '';
  }, [isInScale, selectedScale, note, scaleNotes]);

  // Determine note type for coloring
  const getNoteType = () => {
    if (!isInScale) return 'non-scale-note';
    if (isRoot) return 'root';
    // Use the already calculated index
    switch (degreeIndex) {
      case 2: return 'third';
      case 4: return 'fifth';
      case 6: return 'seventh';
      default: return 'scale-note';
    }
  };

  // Calculate appropriate octave based on string and fret
  // Memoized to avoid recalculation on every render
  const octave = useMemo(() => {
    // Use provided octaves or fallback to standard guitar tuning
    const baseOctaves = octaves || [2, 2, 3, 3, 3, 4]; // Low E to high E (fallback)

    // Start with the base octave for this string
    let baseOctave = baseOctaves[stringIndex];

    // Calculate note index changes
    const startNoteIndex = NOTES.indexOf(stringNote);

    // Calculate octave shifts based on fret position
    const octaveShift = Math.floor((startNoteIndex + fret) / 12);
    return baseOctave + octaveShift;
  }, [octaves, stringIndex, stringNote, fret]);

  const handleClick = useCallback(() => {
    setIsPlaying(true);
    onNoteTap(note, octave);
    setTimeout(() => setIsPlaying(false), 300);
  }, [note, octave, onNoteTap]);

  // Get the note with octave for display
  const noteWithOctave = `${note}${octave}`;

  const noteType = getNoteType();
  const isHidden = !isInScale && !showNonScaleNotes;

  return (
    <div
      className={`fret ${fret === 0 ? 'first-fret' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        className={`note-marker ${noteType} ${isPlaying ? 'playing' : ''} ${isHidden ? 'hidden-note' : ''}`}
        onClick={handleClick}
        title={`${noteWithOctave}${scaleDegree ? ` (${scaleDegree})` : ''}`}
        aria-label={`Play ${noteWithOctave}${scaleDegree ? `, Degree ${scaleDegree}` : ''}`}
        disabled={isHidden}
      >
        {isInScale ? (showScaleDegrees ? scaleDegree : note) : note}
      </button>
      {isHovered && (
        <div className="note-tooltip">
          {noteWithOctave} {scaleDegree && `(${scaleDegree})`}
        </div>
      )}
    </div>
  );
});

FretboardNote.displayName = 'FretboardNote';

FretboardNote.propTypes = {
  note: PropTypes.string.isRequired,
  fret: PropTypes.number.isRequired,
  isRoot: PropTypes.bool.isRequired,
  scaleNotes: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedScale: PropTypes.shape({
    category: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  showScaleDegrees: PropTypes.bool.isRequired,
  stringNote: PropTypes.string.isRequired,
  onNoteTap: PropTypes.func.isRequired,
  stringIndex: PropTypes.number.isRequired,
  showNonScaleNotes: PropTypes.bool.isRequired,
  octaves: PropTypes.arrayOf(PropTypes.number)
};

// Memoized StringLabel
const StringLabel = React.memo(({ note, index, onClick }) => (
  <button
    type="button"
    className="string-label"
    onClick={() => onClick(note, index)}
    title={`${note} String`}
    aria-label={`Play open ${note} string`}
  >
    {note}
  </button>
));

StringLabel.displayName = 'StringLabel';

StringLabel.propTypes = {
  note: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired
};

const Fretboard = ({ rootNote, selectedScale, showScaleDegrees, setShowScaleDegrees, instrumentConfig, selectedInstrument }) => {
  const [audioInitialized, setAudioInitialized] = useState(false);
  // Use useRef for playing state to avoid re-rendering the whole fretboard during playback
  const isPlayingRef = useRef(false);

  // Use useRef for scroll position to avoid re-renders on scroll
  const scrollPositionRef = useRef(0);
  const fretboardRef = useRef(null);

  const [showLegend, setShowLegend] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [showNonScaleNotes, setShowNonScaleNotes] = useState(false);

  const { tuning, fretCount, fretMarkers, doubleFretMarkers, octaves } = instrumentConfig;

  // Memoize fretboard grid structure to avoid recalculating markers and notes on every render
  const fretboardGrid = useMemo(() => {
    return tuning.map((string, stringIndex) => {
      // Calculate middle string index for marker placement
      const middleStringIndex = Math.floor(tuning.length / 2);

      return [...Array(fretCount + 1)].map((_, fret) => {
        const noteIndex = (NOTES.indexOf(string) + fret) % 12;
        const note = NOTES[noteIndex];
        const isRoot = note === rootNote;

        // Dynamic fret marker logic
        const isMarkerFret = fretMarkers && fretMarkers.includes(fret);
        const isDoubleMarkerFret = doubleFretMarkers && doubleFretMarkers.includes(fret);

        // Single dots
        const isSingleDot = isMarkerFret && !isDoubleMarkerFret;

        // We place single dots on the string just below the middle
        const markerStringIndex = middleStringIndex;

        const isFretMarkerRender = (stringIndex === markerStringIndex && isSingleDot);

        // Custom logic for double dots to look good
        let isDoubleDotRender = false;
        if (isDoubleMarkerFret) {
          if (tuning.length === 6) {
            isDoubleDotRender = (stringIndex === 1 || stringIndex === 4);
          } else if (tuning.length === 4) {
            isDoubleDotRender = (stringIndex === 0 || stringIndex === 3); // Outer strings
          } else {
            isDoubleDotRender = (stringIndex === 0 || stringIndex === tuning.length - 1);
          }
        }

        return {
          note,
          fret,
          isRoot,
          isFretMarkerRender,
          isDoubleDotRender,
          string
        };
      });
    });
  }, [tuning, fretCount, fretMarkers, doubleFretMarkers, rootNote]);

  // Memoize scale notes calculation to avoid recalculating on every render
  // This is now calculated once per scale change, not 150 times per render
  const scaleNotes = useMemo(() => {
    return selectedScale
      ? getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name])
      : [];
  }, [rootNote, selectedScale]);

  // Initialize audio on component mount
  useEffect(() => {
    const initAudio = async () => {
      if (typeof window !== 'undefined') {
        try {
          await SoundfontAudio.initializeAudio();
          await SoundfontAudio.loadInstrument(instrumentConfig.soundfontName || 'acoustic_guitar_steel');
          SoundfontAudio.setVolumeBoost(1.5); // Set default volume boost
          setAudioInitialized(true);
        } catch (error) {
          console.error('Error initializing audio:', error);
        }
      }
    };

    initAudio();
  }, [selectedInstrument, instrumentConfig.soundfontName]);

  // Handle instrument changes
  useEffect(() => {
    if (audioInitialized && instrumentConfig.soundfontName) {
      const loadNewInstrument = async () => {
        try {
          await SoundfontAudio.loadInstrument(instrumentConfig.soundfontName);
        } catch (error) {
          console.error('Error loading instrument:', error);
        }
      };
      loadNewInstrument();
    }
  }, [instrumentConfig.soundfontName, audioInitialized]);

  // Play open string - Memoized callback
  const playOpenString = useCallback(async (stringNote, index) => {
    if (!audioInitialized) return;

    try {
      const octave = octaves ? octaves[index] : 3; // Fallback if octaves not defined

      // Play the string
      await SoundfontAudio.playNote(stringNote, null, octave);
    } catch (error) {
      console.error('Error playing string:', error);
    }
  }, [audioInitialized, octaves]);

  // Handle note tap to play a note - Memoized callback
  const handleNoteTap = useCallback((note, octave) => {
    if (audioInitialized && !isPlayingRef.current) {
      isPlayingRef.current = true;
      SoundfontAudio.playNote(note, null, octave)
        .then(() => {
          setTimeout(() => {
            isPlayingRef.current = false;
          }, 300);
        })
        .catch(error => {
          console.error('Error playing note:', error);
          isPlayingRef.current = false;
        });
    }
  }, [audioInitialized]);

  // Handle scroll buttons - Direct DOM manipulation to avoid re-renders
  const scrollFretboard = (direction) => {
    if (fretboardRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      const newPosition = Math.max(0, scrollPositionRef.current + scrollAmount);

      scrollPositionRef.current = newPosition;
      fretboardRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fretboard-section print-section">
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

          <button
            onClick={() => setShowNonScaleNotes(!showNonScaleNotes)}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showNonScaleNotes ? 'Hide Non-Scale Notes' : 'Show Non-Scale Notes'}
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

      <div className="fretboard-container relative print-fretboard-container">
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
        <div className="fretboard-scroll print-fretboard-scroll" ref={fretboardRef}>
          <div className="fretboard print-fretboard">
            {fretboardGrid.map((stringFrets, stringIndex) => (
              <div key={stringIndex} className="string print-string">
                {stringFrets.map((fretData) => {
                  const { note, fret, isRoot, isFretMarkerRender, isDoubleDotRender, string } = fretData;
                  return (
                    <div
                      className={`fret ${fret === 0 ? 'first-fret' : ''}`}
                      key={`fret-${stringIndex}-${fret}`}
                    >
                      {isFretMarkerRender && (
                        <div className="fret-marker"></div>
                      )}
                      {isDoubleDotRender && (
                        <div className="fret-marker"></div>
                      )}

                      <FretboardNote
                        key={fret}
                        note={note}
                        fret={fret}
                        isRoot={isRoot}
                        scaleNotes={scaleNotes} // Passed from memoized calculation
                        selectedScale={selectedScale}
                        showScaleDegrees={showScaleDegrees}
                        stringNote={string}
                        stringIndex={stringIndex}
                        onNoteTap={handleNoteTap}
                        showNonScaleNotes={showNonScaleNotes}
                        octaves={octaves}
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
          <h4>Fretboard Tips</h4>
          <ul className="hint-list">
            <li>Click on any note to hear how it sounds</li>
            <li>Click on string labels on the left to play open strings</li>
            <li>Use the scroll buttons to navigate along the fretboard</li>
            <li>Enable &quot;Show Scale Degrees&quot; to see the position in the scale (I, II, III, etc.)</li>
            <li>Use the legend to understand the color coding of different scale positions</li>
            <li>Toggle &quot;Show Non-Scale Notes&quot; to reveal notes that are not in the current scale</li>
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
  instrumentConfig: PropTypes.object.isRequired,
  selectedInstrument: PropTypes.string,
  octaves: PropTypes.arrayOf(PropTypes.number),
};

export default Fretboard;
