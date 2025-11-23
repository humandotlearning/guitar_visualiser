import React from 'react';
import PropTypes from 'prop-types';
import { getScaleNotes, SCALE_LIBRARY } from '../utils/musicTheory';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';
import './PianoKeyboardStyles.css';

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
  const scaleNotes = getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]);

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

  // Generate keys
  const keys = [];
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  for (let octave = startOctave; octave <= endOctave; octave++) {
    notes.forEach((note) => {
      const isBlack = note.includes('#');
      const noteName = note;
      const fullNoteName = `${note}${octave}`;

      // Check if note is in scale
      const scaleIndex = scaleNotes.indexOf(note);
      const isInScale = scaleIndex !== -1;
      const isRoot = note === rootNote;

      // Check if note is in the selected chord
      const isInChord = selectedChord.length > 0 && selectedChord.includes(note);

      keys.push({
        note: noteName,
        octave,
        fullNoteName,
        isBlack,
        isInScale,
        isRoot,
        isInChord,
        degree: isInScale ? scaleIndex + 1 : null,
        color: isInScale ? getScaleDegreeColor(scaleIndex) : null
      });
    });
  }

  const playNote = (note, octave) => {
    SoundfontAudio.playNote(note, null, octave);
  };

  return (
    <div className="piano-wrapper">
      {/* Toggle Controls */}
      <div className="piano-controls">
        <button
          onClick={onToggleScale}
          className={`toggle-button ${showScaleVisualization ? 'active' : ''}`}
          title="Toggle scale note visualization"
        >
          {showScaleVisualization ? '✓' : ''} Show Scale Notes
        </button>
        <button
          onClick={onToggleChord}
          className={`toggle-button ${showChordVisualization ? 'active' : ''}`}
          title="Toggle chord note highlighting"
        >
          {showChordVisualization ? '✓' : ''} Show Chord Highlighting
        </button>
      </div>

      {/* Piano Keyboard */}
      <div className="piano-container">
        <div className="piano-keys">
          {keys.map((key) => {
            // Determine the style for this key
            const keyStyle = {};

            // Set CSS variable for scale color if applicable
            if (showScaleVisualization && key.isInScale && key.color) {
              keyStyle['--key-color'] = key.color;
            }

            // Apply chord highlighting
            if (showChordVisualization && key.isInChord && selectedChord.length > 0) {
              keyStyle.backgroundColor = '#eff6ff'; // Light blue tint for white keys
              keyStyle.borderColor = '#3b82f6';
              if (key.isBlack) {
                keyStyle.backgroundColor = '#1e3a8a'; // Dark blue for black keys
                keyStyle.borderColor = '#60a5fa';
              }
            } else if (showScaleVisualization && key.isInScale && key.color) {
              // Optional: Tint the key slightly with the scale color
              // keyStyle.backgroundColor = `${key.color}20`; // 20 hex = ~12% opacity
            }

            // Determine CSS classes
            const classes = [
              'piano-key',
              key.isBlack ? 'black-key' : 'white-key',
              showScaleVisualization && key.isInScale ? 'in-scale' : '',
              showChordVisualization && key.isInChord ? 'in-chord' : '',
              key.isRoot ? 'is-root' : ''
            ].filter(Boolean).join(' ');

            return (
              <div
                key={key.fullNoteName}
                className={classes}
                style={keyStyle}
                onClick={() => playNote(key.note, key.octave)}
                title={`${key.note}${key.octave}${key.isInScale ? ` - Degree ${key.degree}` : ''}${key.isInChord ? ' (in chord)' : ''}`}
              >
                <div className="note-label">
                  {showScaleDegrees && key.isInScale ? key.degree : (showScaleVisualization && (key.isInScale || key.isRoot) ? key.note : '')}
                </div>
              </div>
            );
          })}
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
