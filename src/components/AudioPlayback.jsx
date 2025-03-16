import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';
import { getScaleNotes, SCALE_LIBRARY } from '../utils/musicTheory';
import './SoundSettings.css';

const AudioPlayback = ({ rootNote, selectedScale, selectedChord, selectedInstrument, onInstrumentChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [activeElement, setActiveElement] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [sustain, setSustain] = useState(1.5);
  const [localInstrument, setLocalInstrument] = useState(selectedInstrument || 'acoustic_guitar_steel');
  
  // Reference to detect clicks outside the settings panel
  const settingsRef = useRef(null);

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

  // Get scale notes if rootNote and selectedScale are provided
  const scaleNotes = selectedScale && rootNote ? 
    getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]) : [];

  // Close settings when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    }

    // Bind the event listener
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  // Initialize audio context on mount and handle instrument changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initAudio = async () => {
        try {
          await SoundfontAudio.initializeAudio();
          await SoundfontAudio.loadInstrument(localInstrument);
          // Apply audio settings
          SoundfontAudio.setVolume(volume);
          SoundfontAudio.setSustain(sustain);
          setAudioInitialized(true);
        } catch (error) {
          console.error('Error initializing audio:', error);
        }
      };

      // Initialize on first user interaction
      const handleFirstInteraction = () => {
        initAudio();
        document.removeEventListener('click', handleFirstInteraction);
      };

      document.addEventListener('click', handleFirstInteraction, { once: true });

      return () => {
        document.removeEventListener('click', handleFirstInteraction);
      };
    }
  }, []);

  // Handle instrument and audio setting changes
  useEffect(() => {
    if (audioInitialized) {
      const updateAudioSettings = async () => {
        try {
          if (selectedInstrument && selectedInstrument !== localInstrument) {
            setLocalInstrument(selectedInstrument);
            await SoundfontAudio.loadInstrument(selectedInstrument);
          }
          // Update audio settings
          SoundfontAudio.setVolume(volume);
          SoundfontAudio.setSustain(sustain);
        } catch (error) {
          console.error('Error updating audio settings:', error);
        }
      };
      updateAudioSettings();
    }
  }, [selectedInstrument, volume, sustain, audioInitialized, localInstrument]);

  // Play a single note with the current instrument
  const playNote = async (note, duration = null) => {
    if (!audioInitialized) return;
    try {
      await SoundfontAudio.playNote(note, duration);
    } catch (error) {
      console.error('Error playing note:', error);
    }
  };

  // Play the entire scale sequentially
  const playScale = async () => {
    if (!audioInitialized || isPlaying || scaleNotes.length === 0) return;
    
    setActiveElement('scale');
    setIsPlaying(true);
    try {
      // Play notes sequentially with a delay between them
      for (let i = 0; i < scaleNotes.length; i++) {
        await new Promise(resolve => {
          setTimeout(() => {
            playNote(scaleNotes[i]);
            resolve();
          }, i === 0 ? 0 : 500); // No delay for first note
        });
      }
    } catch (err) {
      console.error('Error playing scale:', err);
    } finally {
      setTimeout(() => setIsPlaying(false), 500);
    }
  };

  // Play chord (all notes together)
  const playChord = async () => {
    if (!audioInitialized || isPlaying || !selectedChord || selectedChord.length === 0) return;
    
    setActiveElement('chord');
    setIsPlaying(true);
    try {
      await SoundfontAudio.playChord(selectedChord);
      setTimeout(() => setIsPlaying(false), 1500);
    } catch (error) {
      console.error('Error playing chord:', error);
      setIsPlaying(false);
    }
  };

  // Play an arpeggio of the selected chord
  const playArpeggio = async () => {
    if (!audioInitialized || isPlaying || !selectedChord || selectedChord.length === 0) return;
    
    setActiveElement('arpeggio');
    setIsPlaying(true);
    try {
      // Play chord notes sequentially
      for (let i = 0; i < selectedChord.length; i++) {
        await new Promise(resolve => {
          setTimeout(() => {
            playNote(selectedChord[i]);
            resolve();
          }, i === 0 ? 0 : 250); // Faster than scale for arpeggio
        });
      }
    } catch (error) {
      console.error('Error playing arpeggio:', error);
    } finally {
      setTimeout(() => setIsPlaying(false), 500);
    }
  };

  // Play a test note with the current instrument
  const playTestNote = async () => {
    try {
      // Play a simple E chord to test the instrument
      await SoundfontAudio.playChord(['E', 'G#', 'B'], sustain);
    } catch (error) {
      console.error('Error playing test note:', error);
    }
  };

  // Get the first chord note for display
  const getChordRootName = () => {
    return selectedChord && selectedChord.length > 0 ? selectedChord[0] : '';
  };

  // Close the settings panel
  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className="audio-playback relative">
      {/* Overlay for when settings are open */}
      {isSettingsOpen && <div className="overlay" onClick={closeSettings}></div>}
      
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Audio Playback</h2>
        
        {/* Settings button */}
        <button 
          className={`settings-toggle settings-toggle-small ${isSettingsOpen ? 'active' : ''}`}
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          aria-label="Sound Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="2"></circle>
            <path d="M13.45 13.45L13 17h-6l-.45-3.55a6.07 6.07 0 01-1.64-.95L1.5 14.5.5 12l2.9-1.74c-.02-.17-.03-.34-.03-.51 0-.17.01-.34.03-.51L.5 7.5l1-2.5 3.41 2c.53-.38 1.07-.7 1.64-.95L7 2.5h6l.45 3.55c.57.25 1.11.57 1.64.95l3.41-2 1 2.5-2.9 1.74c.02.17.03.34.03.51 0 .17-.01.34-.03.51l2.9 1.74-1 2.5-3.41-2a6.07 6.07 0 01-1.64.95z"></path>
          </svg>
        </button>
      </div>
        
      {/* Settings panel (modal style) */}
      {isSettingsOpen && (
        <div className="settings-panel settings-panel-audio" ref={settingsRef}>
          <div className="settings-header">
            <div className="settings-title">Audio Settings</div>
            <button className="settings-close" onClick={closeSettings}>
              ×
            </button>
          </div>

          <div className="setting-group">
            <label htmlFor="audio-instrument-select">Guitar Sound</label>
            <div className="instrument-controls instrument-row">
              <div className="selected-instrument">
                <span className="selected-instrument-name">{instruments[localInstrument]}</span>
              </div>
              <select
                id="audio-instrument-select"
                value={localInstrument}
                onChange={(e) => {
                  setLocalInstrument(e.target.value);
                  onInstrumentChange(e.target.value);
                }}
                className="instrument-select"
              >
                {Object.entries(instruments).map(([value, name]) => (
                  <option key={value} value={value}>
                    {name}
                  </option>
                ))}
              </select>
              <button 
                className="test-sound-button"
                onClick={playTestNote}
              >
                Test Sound
              </button>
            </div>
          </div>
          
          <div className="setting-group">
            <div className="slider-container">
              <label htmlFor="volume-control-audio">Volume: {Math.round(volume * 100)}%</label>
              <div className="slider-wrapper">
                <input
                  id="volume-control-audio"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
            </div>
          </div>
          
          <div className="setting-group">
            <div className="slider-container">
              <label htmlFor="sustain-control-audio">Sustain: {sustain.toFixed(1)}s</label>
              <div className="slider-wrapper">
                <input
                  id="sustain-control-audio"
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={sustain}
                  onChange={(e) => setSustain(parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
            </div>
          </div>
        </div>
      )}
        
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={playScale}
          disabled={isPlaying || scaleNotes.length === 0}
          className={`p-2 ${isPlaying && activeElement === 'scale' ? 'bg-green-500' : 'bg-blue-500'} text-white rounded disabled:opacity-50`}
        >
          {isPlaying && activeElement === 'scale' ? 'Playing...' : `${rootNote} ${selectedScale?.name || ''} Scale`}
        </button>
        <button
          onClick={playChord}
          disabled={isPlaying || !selectedChord || selectedChord.length === 0}
          className={`p-2 ${isPlaying && activeElement === 'chord' ? 'bg-green-500' : 'bg-blue-500'} text-white rounded disabled:opacity-50`}
        >
          {isPlaying && activeElement === 'chord' ? 'Playing...' : `${getChordRootName()} Chord`}
        </button>
        <button
          onClick={playArpeggio}
          disabled={isPlaying || !selectedChord || selectedChord.length === 0}
          className={`p-2 ${isPlaying && activeElement === 'arpeggio' ? 'bg-green-500' : 'bg-blue-500'} text-white rounded disabled:opacity-50`}
        >
          {isPlaying && activeElement === 'arpeggio' ? 'Playing...' : `${getChordRootName()} Arpeggio`}
        </button>
      </div>
      {!audioInitialized && (
        <p className="text-sm text-gray-500 mt-2">
          Click anywhere to initialize audio...
        </p>
      )}
      {selectedChord && selectedChord.length > 0 && (
        <div className="mt-2">
          <p className="text-sm">Selected Chord: <span className="font-medium">{selectedChord.join(' - ')}</span></p>
        </div>
      )}
    </div>
  );
};

AudioPlayback.propTypes = {
  rootNote: PropTypes.string,
  selectedScale: PropTypes.shape({
    category: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  selectedChord: PropTypes.array,
  selectedInstrument: PropTypes.string,
  onInstrumentChange: PropTypes.func.isRequired
};

export default AudioPlayback;