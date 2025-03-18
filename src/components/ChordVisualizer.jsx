import React, { useEffect, useState } from 'react';
import { getChordNotes, CHORD_TYPES, SCALE_LIBRARY, getScaleNotes } from '../utils/musicTheory';
import PropTypes from 'prop-types';
import ClientOnly from '../utils/clientOnly';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';
import './ChordVisualizer.css';

// Dynamically import the Chord component to avoid SSR issues
const ChordComponent = ({ variation, instrument, onPlayChord }) => {
  const [Chord, setChord] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@tombatossals/react-chords/lib/Chord').then((module) => {
        setChord(() => module.default);
      });
    }
  }, []);

  const handleClick = () => {
    onPlayChord(variation);
  };

  if (!Chord) return <div className="h-24 w-full bg-gray-100 animate-pulse rounded"></div>;
  return (
    <div onClick={handleClick} style={{ cursor: 'pointer' }} title="Click to play chord">
      <Chord chord={variation} instrument={instrument} lite={false} />
    </div>
  );
};

ChordComponent.propTypes = {
  variation: PropTypes.object.isRequired,
  instrument: PropTypes.object.isRequired,
  onPlayChord: PropTypes.func.isRequired
};

const CHORD_TYPE_MAP = {
  major: 'major',
  minor: 'minor',
  m: 'minor',
  dim: 'dim',
  dim7: 'dim7',
  sus2: 'sus2',
  sus4: 'sus4',
  // Add other mappings as needed
};

// Function to map chord names to JSON keys, handling enharmonic equivalents
const mapChordNameToJsonKey = (chordName) => {
  const enharmonicMap = {
    'G#': 'Ab',
    'D#': 'Eb',
    'E#': 'F',
    'B#': 'C',
    'F#': 'G',
    'C#': 'D',
    'A#': 'Bb'
  };
  return enharmonicMap[chordName] || chordName.replace('#', 'sharp');
};

const ChordVisualizer = ({ rootNote, selectedScale, onChordSelect, selectedInstrument }) => {
  const [chords, setChords] = useState({});
  const [selectedChord, setSelectedChord] = useState(null);
  const [selectedChordName, setSelectedChordName] = useState('');
  const [chordVariations, setChordVariations] = useState([]);
  const [guitarChordsData, setGuitarChordsData] = useState(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [lastTapChord, setLastTapChord] = useState(null);
  const [playingAllChords, setPlayingAllChords] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(null);

  // Initialize audio when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        SoundfontAudio.initializeAudio();
        SoundfontAudio.loadInstrument(selectedInstrument || 'acoustic_guitar_steel');
        setAudioInitialized(true);
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    }
  }, [selectedInstrument]);

  // Load the guitar.json data on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('../db/guitar.json').then((data) => {
        setGuitarChordsData(data.default);
      }).catch(err => {
        console.error('Failed to load guitar chord data:', err);
      });
    }
  }, []);

  useEffect(() => {
    if (rootNote && selectedScale) {
      const chordNotes = getChordNotes(rootNote, selectedScale);
      setChords(chordNotes);
      // Select the root chord by default
      const rootChord = Object.keys(chordNotes)[0];
      setSelectedChord(chordNotes[rootChord]);
      setSelectedChordName(rootChord);
    }
  }, [rootNote, selectedScale]);

  // Handle instrument changes
  useEffect(() => {
    if (audioInitialized && selectedInstrument) {
      const loadNewInstrument = async () => {
        try {
          await SoundfontAudio.loadInstrument(selectedInstrument);
        } catch (error) {
          console.error('Error loading instrument:', error);
        }
      };
      loadNewInstrument();
    }
  }, [selectedInstrument, audioInitialized]);

  useEffect(() => {
    if (selectedChord && guitarChordsData) {
      const chordName = Object.keys(chords).find(key => chords[key] === selectedChord);
      setSelectedChordName(chordName || '');
      const chordTypeIndex = Object.keys(chords).indexOf(chordName);
      const chordType = CHORD_TYPES[selectedScale.category][chordTypeIndex] || 'major';
      const chordSuffix = CHORD_TYPE_MAP[chordType] || chordType; // Use the mapping

      // Map chord name to JSON key
      const jsonKey = mapChordNameToJsonKey(chordName);
      const chordData = guitarChordsData.chords[jsonKey]?.find(chord => chord.suffix === chordSuffix);
      if (!chordData) {
        console.warn(`No chord data found for ${chordName} with type ${chordSuffix}`);
      }

      const variations = chordData ? chordData.positions : [];
      setChordVariations(variations);
    }
  }, [selectedChord, chords, selectedScale, guitarChordsData]);

  // Handle double tap to select and play chord
  const handleChordTap = (chordRoot, chordNotes) => {
    const now = Date.now();
    const doubleTapThreshold = 300; // ms
    
    // Update the selected chord regardless
    onChordSelect(chordNotes);
    setSelectedChord(chordNotes);
    
    // Check if it's a double tap on the same chord
    if (now - lastTapTime < doubleTapThreshold && lastTapChord === chordRoot) {
      // It's a double tap, so play the chord
      playSelectedChord();
    }
    
    setLastTapTime(now);
    setLastTapChord(chordRoot);
  };

  // Play a chord based on variation
  const playChordVariation = async (variation) => {
    if (!audioInitialized || isPlaying) return;

    setIsPlaying(true);
    try {
      // Extract the notes from the chord variation
      const notes = [];
      const tuning = ['E', 'A', 'D', 'G', 'B', 'E']; // Standard guitar tuning
      const baseFrets = [2, 2, 3, 3, 3, 4]; // Base octaves for each string

      // Process each string in the chord
      variation.frets.forEach((fret, stringIndex) => {
        if (fret !== -1) { // -1 means string is not played
          const stringNote = tuning[tuning.length - 1 - stringIndex]; // Reverse index since chord diagrams go from high to low
          const baseOctave = baseFrets[stringIndex];
          
          const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
          const noteIndex = (NOTES.indexOf(stringNote) + fret) % 12;
          const note = NOTES[noteIndex];
          
          // Calculate octave shift
          const octaveShift = Math.floor((NOTES.indexOf(stringNote) + fret) / 12);
          const octave = baseOctave + octaveShift;
          
          notes.push({ note, octave });
        }
      });

      // Play each note in the chord
      await Promise.all(notes.map(({ note, octave }) => 
        SoundfontAudio.playNote(note, null, octave)
      ));

      // Add a slight delay before allowing another chord to be played
      setTimeout(() => setIsPlaying(false), 1500);
    } catch (error) {
      console.error('Error playing chord:', error);
      setIsPlaying(false);
    }
  };

  // Play the selected chord (all notes)
  const playSelectedChord = async () => {
    if (!audioInitialized || isPlaying || !selectedChord) return;

    setIsPlaying(true);
    try {
      await SoundfontAudio.playChord(selectedChord);
      setTimeout(() => setIsPlaying(false), 1500);
    } catch (error) {
      console.error('Error playing chord:', error);
      setIsPlaying(false);
    }
  };

  // Play all chords in the scale sequentially
  const playAllChords = async () => {
    if (!audioInitialized || playingAllChords || Object.keys(chords).length === 0) return;
    
    setPlayingAllChords(true);
    try {
      // Play chords sequentially with a delay between them
      const chordKeys = Object.keys(chords);
      for (let i = 0; i < chordKeys.length; i++) {
        const chordKey = chordKeys[i];
        setCurrentChordIndex(i);
        onChordSelect(chords[chordKey]);
        setSelectedChord(chords[chordKey]);
        
        // Play the chord
        await SoundfontAudio.playChord(chords[chordKey]);
        
        // Wait before playing the next chord
        if (i < chordKeys.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (err) {
      console.error('Error playing chords:', err);
    } finally {
      // Reset after playing is complete
      setTimeout(() => {
        setPlayingAllChords(false);
        setCurrentChordIndex(null);
      }, 500);
    }
  };

  if (!rootNote || !selectedScale) {
    return <div className="chord-visualizer"><p>Please select a scale.</p></div>;
  }

  const { category, name } = selectedScale;
  const scaleChords = SCALE_LIBRARY[category][name];
  const chordTypes = CHORD_TYPES[category];
  const scaleNotes = getScaleNotes(rootNote, scaleChords);

  const instrument = {
    strings: 6,
    fretsOnChord: 4,
    name: 'Guitar',
    keys: [],
    tunings: {
      standard: ['E', 'A', 'D', 'G', 'B', 'E']
    }
  };

  return (
    <ClientOnly fallback={<div className="chord-visualizer p-4">Loading chord visualizer...</div>}>
      <div className="chord-visualizer">
        <div className="flex items-center justify-between mb-4">
          <p className="double-tap-instruction">Double-tap on any chord to play it</p>
          <button 
            onClick={playAllChords}
            disabled={playingAllChords || !audioInitialized}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 flex items-center"
          >
            {playingAllChords ? (
              <span>Playing Chords...</span>
            ) : (
              <span>Play All Chords</span>
            )}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="chord-table">
            <thead>
              <tr>
                {scaleNotes.map((note, index) => (
                  <th key={index}>{note}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.keys(chords).map((chordRoot, index) => {
                  const isSelected = selectedChord === chords[chordRoot];
                  const isPlaying = currentChordIndex === index && playingAllChords;
                  return (
                    <td key={index}>
                      <button
                        onClick={() => handleChordTap(chordRoot, chords[chordRoot])}
                        className={`chord-button ${isSelected ? 'selected-chord' : ''} ${isPlaying ? 'playing-chord' : ''}`}
                        title="Double-tap to play"
                      >
                        {chordRoot}{chordTypes[index]}
                      </button>
                      <div className="chord-notes">
                        {chords[chordRoot].join(', ')}
                      </div>
                      <div className="chord-degree">
                        {index + 1} {chordTypes[index]}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        
        {selectedChord && chordVariations.length > 0 ? (
          <>
            <h3 className="text-lg font-semibold mt-4 mb-2">Chord Variations of {selectedChordName}{chordTypes[Object.keys(chords).indexOf(selectedChordName)]}</h3>
            <p className="text-sm mb-2">Click on a chord diagram to hear how it sounds</p>
            <div className="chord-grid">
              {chordVariations.map((variation, index) => (
                <div key={index} className="chord-variation">
                  <h3 className="variation-title">Variation {index + 1}</h3>
                  <ChordComponent 
                    variation={variation} 
                    instrument={instrument} 
                    onPlayChord={playChordVariation}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>No variations available for this chord.</p>
        )}
      </div>
    </ClientOnly>
  );
};

ChordVisualizer.propTypes = {
  rootNote: PropTypes.string.isRequired,
  selectedScale: PropTypes.shape({
    category: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onChordSelect: PropTypes.func.isRequired,
  selectedInstrument: PropTypes.string
};

export default ChordVisualizer;
