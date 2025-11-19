import React, { useState, useEffect, useRef } from 'react';
import { NOTES, getScaleNotes, SCALE_LIBRARY, getScaleDegree } from '../utils/musicTheory';
import './Fretboard.css';
import './FretboardSection.css';
import './PrintStyles.css'; // Import print styles
import PropTypes from 'prop-types';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';

const FretboardNote = ({ note, fret, isRoot, selectedScale, showScaleDegrees, rootNote, stringNote, onNoteTap, stringIndex, showNonScaleNotes, octaves }) => {
  const [isHovered, setIsHovered] = useState(false);
  const scaleNotes = selectedScale ? getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]) : [];
  const isInScale = scaleNotes.includes(note);
  const scaleDegree = isInScale ? getScaleDegree(note, rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]) : '';
  const [isPlaying, setIsPlaying] = useState(false);

  // Determine note type for coloring
  const getNoteType = () => {
    if (!isInScale) return 'non-scale-note';
    if (isRoot) return 'root';
    const interval = scaleNotes.indexOf(note);
    switch (interval) {
      case 2: return 'third';
      case 4: return 'fifth';
      case 6: return 'seventh';
      default: return 'scale-note';
    }
  };

  // Calculate appropriate octave based on string and fret
  const getOctave = () => {
    // Use provided octaves or fallback to standard guitar tuning
    const baseOctaves = octaves || [2, 2, 3, 3, 3, 4]; // Low E to high E (fallback)

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

  // Get the note with octave for display
  const noteWithOctave = `${note}${getOctave()}`;

  return (
    <div
      className={`fret ${fret === 0 ? 'first-fret' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`note-marker ${getNoteType()} ${isPlaying ? 'playing' : ''} ${!isInScale && !showNonScaleNotes ? 'hidden-note' : ''}`}
        onClick={handleClick}
        title={`${noteWithOctave}${scaleDegree ? ` (${scaleDegree})` : ''}`}
      >
        {isInScale ? (showScaleDegrees ? scaleDegree : note) : note}
      </div>
      {isHovered && (
        <div className="note-tooltip">
          {noteWithOctave} {scaleDegree && `(${scaleDegree})`}
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
  stringIndex: PropTypes.number.isRequired,
  showNonScaleNotes: PropTypes.bool.isRequired
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

const Fretboard = ({ rootNote, selectedScale, showScaleDegrees, setShowScaleDegrees, instrumentConfig, selectedInstrument }) => {
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const fretboardRef = useRef(null);
  const [showLegend, setShowLegend] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [showNonScaleNotes, setShowNonScaleNotes] = useState(false);

  const { tuning, fretCount, fretMarkers, doubleFretMarkers, octaves } = instrumentConfig;

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
      const octave = octaves ? octaves[index] : 3; // Fallback if octaves not defined

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
            {tuning.map((string, stringIndex) => (
              <div key={stringIndex} className="string print-string">
                {[...Array(fretCount + 1)].map((_, fret) => {
                  const noteIndex = (NOTES.indexOf(string) + fret) % 12;
                  const note = NOTES[noteIndex];
                  const isRoot = note === rootNote;

                  // Dynamic fret marker logic
                  const isMarkerFret = fretMarkers && fretMarkers.includes(fret);
                  const isDoubleMarkerFret = doubleFretMarkers && doubleFretMarkers.includes(fret);

                  // Calculate middle string index for marker placement
                  // For even number of strings (e.g. 4 or 6), we want to place it between the middle two strings
                  // For 6 strings (0-5), middle is between 2 and 3. We place on 3 (bottom half) or 2 (top half) or just on one string with offset
                  // The original code placed markers on specific strings.
                  // Let's try to replicate the original look but dynamically.

                  const middleStringIndex = Math.floor(tuning.length / 2);

                  // Single dots
                  const isSingleDot = isMarkerFret && !isDoubleMarkerFret;

                  // We place single dots on the string just below the middle (e.g. index 3 for guitar, index 2 for ukulele)
                  // And we use CSS to shift it up to be between strings.
                  const markerStringIndex = middleStringIndex;

                  const isFretMarker = (
                    stringIndex === markerStringIndex && isSingleDot
                  );

                  // Double dots
                  // Usually on the strings above and below the center line?
                  // Or just two dots on the center line?
                  // Original code: 
                  // (stringIndex === 1 && fret === 12) || (stringIndex === 4 && fret === 12) for guitar (indices 1 and 4 are B and A)
                  // For Ukulele (4 strings), double dots usually on G and A? Or C and E?
                  // Let's just place them on the strings around the middle.

                  const isDoubleDotTop = isDoubleMarkerFret && stringIndex === (middleStringIndex - 1); // e.g. 2 for guitar
                  const isDoubleDotBottom = isDoubleMarkerFret && stringIndex === (middleStringIndex + 1); // e.g. 4 for guitar (Wait, original was 1 and 4. 1 is B, 4 is A. Middle is between 2(G) and 3(D). So 1 and 4 are outer.)

                  // Let's stick to a simple logic:
                  // Single markers: on middleStringIndex
                  // Double markers: on middleStringIndex - 1 and middleStringIndex + 1? 
                  // Or just hardcode for now based on string count if we want exact replica, but we want dynamic.
                  // Let's use:
                  // Single: middleStringIndex
                  // Double: middleStringIndex - 1 and middleStringIndex + 1 (if available)

                  // For Guitar (6 strings): Middle is 3. Single on 3. Double on 2 and 4?
                  // Original was: Single on 3. Double on 1 and 4.

                  // For Ukulele (4 strings): Middle is 2. Single on 2. Double on 1 and 3?
                  // Let's try this.

                  const isDoubleDot = isDoubleMarkerFret && (stringIndex === (middleStringIndex - 2) || stringIndex === (middleStringIndex + 1));
                  // Wait, for guitar (6): middle=3. 3-2=1. 3+1=4. This matches original (1 and 4).
                  // For ukulele (4): middle=2. 2-2=0. 2+1=3. So strings 0 and 3. (Top and Bottom strings).
                  // That seems reasonable for double dots on uke? Or maybe 1 and 2?
                  // Let's use a safer logic.

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
                        selectedScale={selectedScale}
                        showScaleDegrees={showScaleDegrees}
                        rootNote={rootNote}
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
};

export default Fretboard;