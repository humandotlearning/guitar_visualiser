import React, { useState, useEffect } from 'react';
import { NOTES, getScaleNotes, SCALE_LIBRARY, getScaleDegree } from '../utils/musicTheory';
import PropTypes from 'prop-types';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';
import './PianoKeyboard.css';

const PianoKey = ({ note, octave, isBlackKey, isInScale, noteType, showScaleDegrees, scaleDegree, onKeyClick, isPlaying, style }) => {
  const displayLabel = isInScale ? (showScaleDegrees ? scaleDegree : note) : note;

  return (
    <div
      className={`piano-key ${isBlackKey ? 'black-key' : 'white-key'} ${noteType} ${isPlaying ? 'playing' : ''} ${!isInScale ? 'non-scale-key' : ''}`}
      onClick={() => onKeyClick(note, octave)}
      title={`${note}${octave}${scaleDegree ? ` (${scaleDegree})` : ''}`}
      style={style}
    >
      <span className="key-label">{isInScale ? displayLabel : ''}</span>
    </div>
  );
};

PianoKey.propTypes = {
  note: PropTypes.string.isRequired,
  octave: PropTypes.number.isRequired,
  isBlackKey: PropTypes.bool.isRequired,
  isInScale: PropTypes.bool.isRequired,
  noteType: PropTypes.string.isRequired,
  showScaleDegrees: PropTypes.bool.isRequired,
  scaleDegree: PropTypes.string,
  onKeyClick: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  style: PropTypes.object,
};

const PianoKeyboard = ({ rootNote, selectedScale, showScaleDegrees, setShowScaleDegrees, instrumentConfig }) => {
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [playingKey, setPlayingKey] = useState(null);
  const [showLegend, setShowLegend] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [showNonScaleNotes, setShowNonScaleNotes] = useState(false);

  const { startOctave = 2, endOctave = 6 } = instrumentConfig;

  // Initialize audio on component mount
  useEffect(() => {
    const initAudio = async () => {
      if (typeof window !== 'undefined') {
        try {
          await SoundfontAudio.initializeAudio();
          await SoundfontAudio.loadInstrument(instrumentConfig.soundfontName || 'acoustic_grand_piano');
          SoundfontAudio.setVolumeBoost(1.5);
          setAudioInitialized(true);
        } catch (error) {
          console.error('Error initializing audio:', error);
        }
      }
    };

    initAudio();
  }, [instrumentConfig.soundfontName]);

  // Get scale notes for highlighting
  const scaleNotes = selectedScale
    ? getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name])
    : [];

  // Determine note type for coloring (same logic as Fretboard)
  const getNoteType = (note, isInScale, isRoot) => {
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

  // Check if a note is a black key
  const isBlackKey = (note) => {
    return note.includes('#');
  };

  // Handle key click to play note
  const handleKeyClick = async (note, octave) => {
    if (!audioInitialized) return;

    setPlayingKey(`${note}${octave}`);
    try {
      await SoundfontAudio.playNote(note, null, octave);
      setTimeout(() => setPlayingKey(null), 300);
    } catch (error) {
      console.error('Error playing note:', error);
      setPlayingKey(null);
    }
  };

  // Generate all piano keys
  const generateKeys = () => {
    const keys = [];

    for (let octave = startOctave; octave <= endOctave; octave++) {
      for (let i = 0; i < NOTES.length; i++) {
        const note = NOTES[i];
        const isRoot = note === rootNote;
        const isInScale = scaleNotes.includes(note);
        const noteType = getNoteType(note, isInScale, isRoot);
        const scaleDegree = isInScale
          ? getScaleDegree(note, rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name])
          : '';

        keys.push({
          note,
          octave,
          isBlackKey: isBlackKey(note),
          isRoot,
          isInScale,
          noteType,
          scaleDegree,
          id: `${note}${octave}`,
        });
      }
    }

    return keys;
  };

  const allKeys = generateKeys();
  const whiteKeys = allKeys.filter(k => !k.isBlackKey);
  const blackKeys = allKeys.filter(k => k.isBlackKey);

  // Calculate black key positions
  const getBlackKeyPosition = (note, octave) => {
    const octaveOffset = (octave - startOctave) * 7;
    const blackKeyPositions = {
      'C#': 0,
      'D#': 1,
      'F#': 3,
      'G#': 4,
      'A#': 5,
    };

    const position = blackKeyPositions[note];
    if (position === undefined) return null;

    // Each white key is about 40px wide, black keys sit between them
    const whiteKeyIndex = octaveOffset + position;
    return whiteKeyIndex * 40 + 28; // Offset to position between white keys
  };

  return (
    <div className="piano-section print-section">
      <div className="piano-controls flex items-center justify-between mb-3">
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
      </div>

      <p className="text-sm text-gray-500 mb-3">Click on keys to hear them</p>

      <div className="piano-container">
        <div className="piano-keyboard">
          {/* White keys */}
          <div className="white-keys-container">
            {whiteKeys.map((key) => (
              <PianoKey
                key={key.id}
                note={key.note}
                octave={key.octave}
                isBlackKey={false}
                isRoot={key.isRoot}
                isInScale={key.isInScale}
                noteType={key.noteType}
                showScaleDegrees={showScaleDegrees}
                scaleDegree={key.scaleDegree}
                onKeyClick={handleKeyClick}
                isPlaying={playingKey === key.id}
              />
            ))}
          </div>

          {/* Black keys */}
          <div className="black-keys-container">
            {blackKeys.map((key) => {
              const leftPosition = getBlackKeyPosition(key.note, key.octave);
              if (leftPosition === null) return null;

              return (
                <PianoKey
                  key={key.id}
                  note={key.note}
                  octave={key.octave}
                  isBlackKey={true}
                  isRoot={key.isRoot}
                  isInScale={key.isInScale}
                  noteType={key.noteType}
                  showScaleDegrees={showScaleDegrees}
                  scaleDegree={key.scaleDegree}
                  onKeyClick={handleKeyClick}
                  isPlaying={playingKey === key.id}
                  style={{ left: `${leftPosition}px` }}
                />
              );
            })}
          </div>
        </div>

        {/* Octave labels */}
        <div className="octave-labels">
          {Array.from({ length: endOctave - startOctave + 1 }, (_, i) => (
            <div key={i} className="octave-label">
              C{startOctave + i}
            </div>
          ))}
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
        <div className="piano-hints">
          <h4>Piano Tips</h4>
          <ul className="hint-list">
            <li>Click on any key to hear how it sounds</li>
            <li>Highlighted keys show notes in the selected scale</li>
            <li>Enable &quot;Show Scale Degrees&quot; to see the position in the scale (1, 2, 3, etc.)</li>
            <li>Use the legend to understand the color coding of different scale positions</li>
            <li>Toggle &quot;Show Non-Scale Notes&quot; to see labels on all keys</li>
          </ul>
        </div>
      )}
    </div>
  );
};

PianoKeyboard.propTypes = {
  rootNote: PropTypes.string.isRequired,
  selectedScale: PropTypes.shape({
    category: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  showScaleDegrees: PropTypes.bool.isRequired,
  setShowScaleDegrees: PropTypes.func.isRequired,
  instrumentConfig: PropTypes.object.isRequired,
};

export default PianoKeyboard;
