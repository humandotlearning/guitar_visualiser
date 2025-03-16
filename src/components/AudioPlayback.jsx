// File: src/components/AudioPlayback.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ClientOnly from '../utils/clientOnly';

const AudioPlayback = ({ scaleNotes, chordNotes }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [instrument, setInstrument] = useState('sine');
  const [instruments, setInstruments] = useState({});
  const [audioContext, setAudioContext] = useState(null);
  
  // Initialize audio context and instruments only on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Define instruments here instead of importing them
      const INSTRUMENTS = {
        'Sine Wave': 'sine',
        'Square Wave': 'square',
        'Sawtooth Wave': 'sawtooth',
        'Triangle Wave': 'triangle'
      };
      setInstruments(INSTRUMENTS);
      
      // Create AudioContext only when needed
      const initAudio = () => {
        // Use AudioContext with fallback for older browsers
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx && !audioContext) {
          setAudioContext(new AudioCtx());
        }
      };
      
      // Initialize on user interaction to avoid autoplay restrictions
      document.addEventListener('click', initAudio, { once: true });
      
      return () => {
        document.removeEventListener('click', initAudio);
        // Clean up AudioContext when component unmounts
        if (audioContext) {
          audioContext.close();
        }
      };
    }
  }, [audioContext]);
  
  const getNoteFrequency = (note) => {
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const A4 = 440;
    const A4Index = NOTES.indexOf('A');
    const noteIndex = NOTES.indexOf(note);
    const octave = 4; // Assuming middle octave
    const halfSteps = noteIndex - A4Index + (octave - 4) * 12;
    return A4 * Math.pow(2, halfSteps / 12);
  };
  
  const playNote = (frequency, duration, type) => {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    // Apply envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  };

  const playScale = () => {
    if (!audioContext) return;
    
    setIsPlaying(true);
    scaleNotes.forEach((note, index) => {
      setTimeout(() => {
        playNote(getNoteFrequency(note), 0.5, instrument);
        if (index === scaleNotes.length - 1) setIsPlaying(false);
      }, index * 500);
    });
  };

  const playChord = () => {
    if (!audioContext) return;
    
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
    <ClientOnly fallback={<div className="mt-4 p-4">Audio playback loading...</div>}>
      <div className="mt-4 space-y-2">
        <div>
          <label htmlFor="instrument" className="mr-2">Instrument:</label>
          <select
            id="instrument"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            className="border rounded p-1"
          >
            {Object.entries(instruments).map(([name, value]) => (
              <option key={value} value={value}>{name}</option>
            ))}
          </select>
        </div>
        <div className="space-x-2">
          <button
            onClick={playScale}
            disabled={isPlaying || !scaleNotes.length || !audioContext}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Play Scale
          </button>
          <button
            onClick={playChord}
            disabled={isPlaying || !chordNotes?.length || !audioContext}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Play Chord
          </button>
        </div>
        {!audioContext && (
          <p className="text-sm text-gray-600">Click anywhere to initialize audio</p>
        )}
      </div>
    </ClientOnly>
  );
};

AudioPlayback.propTypes = {
  scaleNotes: PropTypes.arrayOf(PropTypes.string).isRequired,
  chordNotes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default AudioPlayback;