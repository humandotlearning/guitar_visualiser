import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';
import Spinner from './ui/Spinner';
import './SoundSettings.css';

const SoundSettings = ({ onInstrumentChange }) => {
  const [selectedInstrument, setSelectedInstrument] = useState('acoustic_guitar_steel');
  const [volume, setVolume] = useState(0.8);
  const [sustain, setSustain] = useState(1.5);
  const [isOpen, setIsOpen] = useState(false);
  const [isTestingSound, setIsTestingSound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Reference to detect clicks outside the settings panel
  const settingsRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Available guitar instruments
  const instruments = {
    'acoustic_guitar_nylon': 'Acoustic Guitar (nylon)',
    'acoustic_guitar_steel': 'Acoustic Guitar (steel)',
    'electric_guitar_clean': 'Electric Guitar (clean)',
    'electric_guitar_jazz': 'Electric Guitar (jazz)',
    'electric_guitar_muted': 'Electric Guitar (muted)',
    'overdriven_guitar': 'Overdriven Guitar',
    'distortion_guitar': 'Distortion Guitar',
    'guitar_harmonics': 'Guitar Harmonics'
  };

  // Close settings when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    // Bind the event listener
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Load the selected instrument when it changes
  useEffect(() => {
    const loadInstrument = async () => {
      try {
        setIsLoading(true);
        await SoundfontAudio.loadInstrument(selectedInstrument);
        // Update global audio settings
        SoundfontAudio.setVolume(volume);
        SoundfontAudio.setSustain(sustain);
        // Notify parent component
        if (onInstrumentChange) {
          onInstrumentChange(selectedInstrument);
        }
        if (mountedRef.current) setIsLoading(false);
      } catch (error) {
        console.error('Error loading instrument:', error);
        if (mountedRef.current) setIsLoading(false);
      }
    };

    loadInstrument();
  }, [selectedInstrument, volume, sustain, onInstrumentChange]);

  // Play a test note with the current instrument
  const playTestNote = async () => {
    if (isTestingSound || isLoading) return;

    setIsTestingSound(true);
    try {
      // Play a simple E chord to test the instrument
      await SoundfontAudio.playChord(['E', 'G#', 'B'], sustain);
      // Show playing state for 1.5s
      setTimeout(() => {
        if (mountedRef.current) {
          setIsTestingSound(false);
        }
      }, 1500);
    } catch (error) {
      console.error('Error playing test note:', error);
      if (mountedRef.current) {
        setIsTestingSound(false);
      }
    }
  };

  return (
    <div className="sound-settings" ref={settingsRef}>
      <button 
        className={`settings-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Sound Settings"
        aria-expanded={isOpen}
        aria-controls="sound-settings-panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
      
      {isOpen && (
        <div className="settings-panel" id="sound-settings-panel">
          <div className="setting-group">
            <label htmlFor="instrument-select">Guitar Sound</label>
            <div className="selected-instrument">
              <span className="selected-instrument-name">{instruments[selectedInstrument]}</span>
            </div>
            <div className="instrument-controls">
              <select
                id="instrument-select"
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
                className="instrument-select"
                disabled={isLoading}
              >
                {Object.entries(instruments).map(([value, name]) => (
                  <option key={value} value={value}>
                    {name}
                  </option>
                ))}
              </select>
              <button 
                className={`test-sound-button ${isTestingSound || isLoading ? 'opacity-90 cursor-wait' : ''}`}
                onClick={playTestNote}
                disabled={isTestingSound || isLoading}
                aria-label={isLoading ? "Loading sound" : (isTestingSound ? "Playing test sound" : "Test instrument sound")}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Spinner /> Loading...
                  </span>
                ) : (isTestingSound ? (
                  <span className="flex items-center justify-center">
                    <Spinner /> Playing...
                  </span>
                ) : (
                  'Test Sound'
                ))}
              </button>
            </div>
          </div>
          
          <div className="setting-group">
            <div className="slider-container">
              <label htmlFor="volume-control">Volume: {Math.round(volume * 100)}%</label>
              <div className="slider-wrapper">
                <input
                  id="volume-control"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="slider"
                  aria-valuetext={`${Math.round(volume * 100)}%`}
                />
              </div>
            </div>
          </div>
          
          <div className="setting-group">
            <div className="slider-container">
              <label htmlFor="sustain-control">Sustain: {sustain.toFixed(1)}s</label>
              <div className="slider-wrapper">
                <input
                  id="sustain-control"
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={sustain}
                  onChange={(e) => setSustain(parseFloat(e.target.value))}
                  className="slider"
                  aria-valuetext={`${sustain.toFixed(1)} seconds`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

SoundSettings.propTypes = {
  onInstrumentChange: PropTypes.func
};

export default SoundSettings;
