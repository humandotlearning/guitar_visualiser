// File: src/components/AudioPlayback.jsx
import React, { useState } from 'react';
import { playNote, getNoteFrequency, INSTRUMENTS } from '../utils/audioUtils';
import PropTypes from 'prop-types';

const AudioPlayback = ({ scaleNotes, chordNotes }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [instrument, setInstrument] = useState('sine');

  const playScale = () => {
    setIsPlaying(true);
    scaleNotes.forEach((note, index) => {
      setTimeout(() => {
        playNote(getNoteFrequency(note), 0.5, instrument);
        if (index === scaleNotes.length - 1) setIsPlaying(false);
      }, index * 500);
    });
  };

  const playChord = () => {
    setIsPlaying(true);
    chordNotes.forEach((note, index) => {
      // Slightly stagger chord notes for a more natural sound
      setTimeout(() => {
        playNote(getNoteFrequency(note), 1, instrument);
      }, index * 30);
    });
    setTimeout(() => setIsPlaying(false), 1000);
  };

  return (
    <div className="mt-4 space-y-2">
      <div>
        <label htmlFor="instrument" className="mr-2">Instrument:</label>
        <select
          id="instrument"
          value={instrument}
          onChange={(e) => setInstrument(e.target.value)}
          className="border rounded p-1"
        >
          {Object.entries(INSTRUMENTS).map(([name, value]) => (
            <option key={value} value={value}>{name}</option>
          ))}
        </select>
      </div>
      <div className="space-x-2">
        <button
          onClick={playScale}
          disabled={isPlaying || !scaleNotes.length}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Play Scale
        </button>
        <button
          onClick={playChord}
          disabled={isPlaying || !chordNotes?.length}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Play Chord
        </button>
      </div>
    </div>
  );
};

AudioPlayback.propTypes = {
  scaleNotes: PropTypes.arrayOf(PropTypes.string).isRequired,
  chordNotes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default AudioPlayback;