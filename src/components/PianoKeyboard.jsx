import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getScaleNotes, SCALE_LIBRARY, NOTES } from '../utils/musicTheory';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';
import './PianoKeyboardStyles.css';

// Helper function to get color based on scale degree (matching ScaleNotes.jsx)
const getScaleDegreeColor = (index) => {
  switch (index) {
    case 0: return 'var(--color-tonic)';      // Tonic (I)
    case 1: return 'var(--color-major)';      // Major Step (II)
    case 2: return 'var(--color-minor)';      // Minor Step (III)
    case 3: return 'var(--color-perfect)';    // Perfect Fourth (IV)
    case 4: return 'var(--color-perfect)';    // Perfect Fifth (V)
    case 5: return 'var(--color-major)';      // Major Step (VI)
    case 6: return 'var(--color-minor)';      // Minor Step (VII)
    default: return 'black';
  }
};

const PianoKey = React.memo(({
  note,
  octave,
  isBlack,
  isInScale,
  isRoot,
  isInChord,
  degree,
  color,
  showScaleVisualization,
  showChordVisualization,
  showScaleDegrees,
  hasSelectedChord,
  onPlayNote
}) => {
  // Determine the style for this key
  const keyStyle = {};

  // Set CSS variable for scale color if applicable
  if (showScaleVisualization && isInScale && color) {
    keyStyle['--key-color'] = color;
  }

  // Apply chord highlighting
  if (showChordVisualization && isInChord && hasSelectedChord) {
    keyStyle.backgroundColor = '#eff6ff'; // Light blue tint for white keys
    keyStyle.borderColor = '#3b82f6';
    if (isBlack) {
      keyStyle.backgroundColor = '#1e3a8a'; // Dark blue for black keys
      keyStyle.borderColor = '#60a5fa';
    }
  }

  // Determine CSS classes
  const classes = [
    'piano-key',
    isBlack ? 'black-key' : 'white-key',
    showScaleVisualization && isInScale ? 'in-scale' : '',
    showChordVisualization && isInChord ? 'in-chord' : '',
    isRoot ? 'is-root' : ''
  ].filter(Boolean).join(' ');

  const handleClick = useCallback(() => {
    onPlayNote(note, octave);
  }, [note, octave, onPlayNote]);

  const title = `${note}${octave}${isInScale ? ` - Degree ${degree}` : ''}${isInChord ? ' (in chord)' : ''}`;

  return (
    <button
      type="button"
      className={classes}
      style={keyStyle}
      onClick={handleClick}
      title={title}
      aria-label={`Play ${note}${octave}${isInScale ? `, Degree ${degree}` : ''}`}
    >
      <div className="note-label">
        {showScaleDegrees && isInScale ? degree : (showScaleVisualization && (isInScale || isRoot) ? note : '')}
      </div>
    </button>
  );
});

PianoKey.displayName = 'PianoKey';

PianoKey.propTypes = {
  note: PropTypes.string.isRequired,
  octave: PropTypes.number.isRequired,
  isBlack: PropTypes.bool.isRequired,
  isInScale: PropTypes.bool.isRequired,
  isRoot: PropTypes.bool.isRequired,
  isInChord: PropTypes.bool.isRequired,
  degree: PropTypes.number,
  color: PropTypes.string,
  showScaleVisualization: PropTypes.bool.isRequired,
  showChordVisualization: PropTypes.bool.isRequired,
  showScaleDegrees: PropTypes.bool,
  hasSelectedChord: PropTypes.bool.isRequired,
  onPlayNote: PropTypes.func.isRequired
};

const PianoKeyboard = ({
  rootNote,
  selectedScale,
  showScaleDegrees,
  instrumentConfig,
  selectedChord = [],
  showScaleVisualization = true,
  showChordVisualization = true,
  onToggleScale,
  onToggleChord
}) => {
  const { startOctave, endOctave } = instrumentConfig;

  // Memoize scale notes calculation
  const scaleNotes = useMemo(() => {
    return getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]);
  }, [rootNote, selectedScale]);

  // Memoize keys generation
  const keys = useMemo(() => {
    const generatedKeys = [];

    // Performance optimization: Create Map/Set for O(1) lookups
    const scaleNoteToIndex = new Map(scaleNotes.map((n, i) => [n, i]));
    const chordNoteSet = new Set(selectedChord || []);
    const hasSelectedChord = chordNoteSet.size > 0;

    for (let octave = startOctave; octave <= endOctave; octave++) {
      NOTES.forEach((note) => {
        const isBlack = note.includes('#');
        const noteName = note;
        const fullNoteName = `${note}${octave}`;

        // Check if note is in scale (O(1) lookup)
        const scaleIndex = scaleNoteToIndex.has(note) ? scaleNoteToIndex.get(note) : -1;
        const isInScale = scaleIndex !== -1;
        const isRoot = note === rootNote;

        // Check if note is in the selected chord (O(1) lookup)
        const isInChord = hasSelectedChord && chordNoteSet.has(note);

        generatedKeys.push({
          note: noteName,
          octave,
          fullNoteName,
          isBlack,
          isInScale,
          isRoot,
          isInChord,
          degree: isInScale ? scaleIndex + 1 : null,
          color: isInScale ? getScaleDegreeColor(scaleIndex) : null,
          hasSelectedChord
        });
      });
    }
    return generatedKeys;
  }, [startOctave, endOctave, scaleNotes, rootNote, selectedChord]);

  const playNote = useCallback((note, octave) => {
    SoundfontAudio.playNote(note, null, octave);
  }, []);

  return (
    <div className="piano-wrapper">
      {/* Toggle Controls */}
      <div className="piano-controls">
        <button
          onClick={onToggleScale}
          className={`toggle-button ${showScaleVisualization ? 'active' : ''}`}
          title="Toggle scale note visualization"
          aria-pressed={showScaleVisualization}
        >
          {showScaleVisualization ? '✓' : ''} Show Scale Notes
        </button>
        <button
          onClick={onToggleChord}
          className={`toggle-button ${showChordVisualization ? 'active' : ''}`}
          title="Toggle chord note highlighting"
          aria-pressed={showChordVisualization}
        >
          {showChordVisualization ? '✓' : ''} Show Chord Highlighting
        </button>
      </div>

      {/* Piano Keyboard */}
      <div className="piano-container">
        <div className="piano-keys">
          {keys.map((key) => (
            <PianoKey
              key={key.fullNoteName}
              {...key}
              showScaleVisualization={showScaleVisualization}
              showChordVisualization={showChordVisualization}
              showScaleDegrees={showScaleDegrees}
              onPlayNote={playNote}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

PianoKeyboard.propTypes = {
  rootNote: PropTypes.string.isRequired,
  selectedScale: PropTypes.object.isRequired,
  showScaleDegrees: PropTypes.bool,
  instrumentConfig: PropTypes.object.isRequired,
  selectedChord: PropTypes.array,
  showScaleVisualization: PropTypes.bool,
  showChordVisualization: PropTypes.bool,
  onToggleScale: PropTypes.func,
  onToggleChord: PropTypes.func,
};

export default PianoKeyboard;
