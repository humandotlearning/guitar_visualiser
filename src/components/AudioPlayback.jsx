// File: src/components/AudioPlayback.jsx
import React, { useState } from 'react';

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const playNote = (frequency, duration = 0.5) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
};

const getNoteFrequency = (note) => {
  const A4 = 440;
  const A4Index = 9; // Index of A in the NOTES array
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteIndex = notes.indexOf(note);
  const octave = 4; // Assuming middle octave
  const halfSteps = noteIndex - A4Index + (octave - 4) * 12;
  return A4 * Math.pow(2, halfSteps / 12);
};

const AudioPlayback = ({ scaleNotes, chordNotes }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playScale = () => {
    setIsPlaying(true);
    scaleNotes.forEach((note, index) => {
      setTimeout(() => {
        playNote(getNoteFrequency(note));
        if (index === scaleNotes.length - 1) setIsPlaying(false);
      }, index * 500);
    });
  };

  const playChord = () => {
    setIsPlaying(true);
    chordNotes.forEach(note => playNote(getNoteFrequency(note), 1));
    setTimeout(() => setIsPlaying(false), 1000);
  };

  return (
    <div className="mt-4 space-x-2">
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
  );
};

export default AudioPlayback;