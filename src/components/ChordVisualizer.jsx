import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getChordNotes, CHORD_TYPES, SCALE_LIBRARY, getScaleNotes } from '../utils/musicTheory';
import PropTypes from 'prop-types';
import ClientOnly from '../utils/clientOnly';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';
import './ChordVisualizer.css';

// Dynamically import the Chord component to avoid SSR issues
const ChordComponent = React.memo(({ variation, instrument, onPlayChord }) => {
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
});

ChordComponent.displayName = 'ChordComponent';

ChordComponent.propTypes = {
  variation: PropTypes.object.isRequired,
  instrument: PropTypes.object.isRequired,
  onPlayChord: PropTypes.func.isRequired
};

const CHORD_TYPE_MAP = {
  '': 'major',
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

const getRomanNumeral = (num) => {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  return romanNumerals[num - 1];
};

const ChordVisualizer = ({ rootNote, selectedScale, onChordSelect, instrumentConfig }) => {
  const [chords, setChords] = useState({});
  const [selectedChord, setSelectedChord] = useState(null);
  const [selectedChordName, setSelectedChordName] = useState('');
  const [chordVariations, setChordVariations] = useState([]);
  const [chordData, setChordData] = useState(null);
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
        SoundfontAudio.loadInstrument((instrumentConfig && instrumentConfig.soundfontName) || 'acoustic_guitar_steel');
        setAudioInitialized(true);
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    }
  }, [instrumentConfig]);

  // Load the appropriate chord data based on instrument config
  useEffect(() => {
    if (typeof window !== 'undefined' && instrumentConfig) {
      const loadChordData = async () => {
        try {
          let data;
          if (instrumentConfig.chordDataKey === 'ukulele') {
            data = await import('../db/ukulele.json');
          } else if (instrumentConfig.chordDataKey === 'piano') {
            // For now, we might not have a piano JSON, or we can use a generic one.
            // If no JSON exists, we might need to generate chords algorithmically or just skip loading.
            // Let's assume we don't have a piano.json yet and handle it gracefully.
            data = { default: { chords: {} } };
          } else {
            data = await import('../db/guitar.json');
          }
          setChordData(data.default);
        } catch (err) {
          console.error(`Failed to load chord data for ${instrumentConfig.chordDataKey}:`, err);
        }
      };
      loadChordData();
    }
  }, [instrumentConfig]);

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
    if (audioInitialized && instrumentConfig && instrumentConfig.soundfontName) {
      const loadNewInstrument = async () => {
        try {
          await SoundfontAudio.loadInstrument(instrumentConfig.soundfontName);
        } catch (error) {
          console.error('Error loading instrument:', error);
        }
      };
      loadNewInstrument();
    }
  }, [instrumentConfig, audioInitialized]);

  useEffect(() => {
    if (selectedChord && chordData && selectedScale) {
      const chordName = Object.keys(chords).find(key => JSON.stringify(chords[key]) === JSON.stringify(selectedChord));
      setSelectedChordName(chordName || '');

      if (chordName) {
        const chordTypeIndex = Object.keys(chords).indexOf(chordName);
        const chordType = CHORD_TYPES[selectedScale.category][chordTypeIndex] || 'major';
        const chordSuffix = CHORD_TYPE_MAP[chordType] || chordType; // Use the mapping

        // Map chord name to JSON key
        const jsonKey = mapChordNameToJsonKey(chordName);
        const chordInfo = chordData.chords[jsonKey]?.find(chord => chord.suffix === chordSuffix);
        if (!chordInfo) {
          console.warn(`No chord data found for ${chordName} with type ${chordSuffix}`);
        }

        const variations = chordInfo ? chordInfo.positions : [];
        setChordVariations(variations);
      } else {
        // No chord selected, clear variations
        setChordVariations([]);
      }
    } else {
      // Clear variations if no chord is selected
      setChordVariations([]);
    }
  }, [selectedChord, chords, selectedScale, chordData]);

  // Handle double tap to select and play chord
  const handleChordTap = (chordRoot, chordNotes) => {
    const now = Date.now();
    const doubleTapThreshold = 300; // ms

    // Check if clicking the same chord that's already selected
    const isSameChord = JSON.stringify(selectedChord) === JSON.stringify(chordNotes);

    if (isSameChord) {
      // Deselect the chord
      onChordSelect([]);
      setSelectedChord([]);
      setLastTapTime(0);
      setLastTapChord(null);
      return;
    }

    // Update the selected chord
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
  const playChordVariation = useCallback(async (variation) => {
    if (!audioInitialized || isPlaying || !instrumentConfig) return;

    setIsPlaying(true);
    try {
      // Extract the notes from the chord variation
      const notes = [];
      const { tuning, octaves } = instrumentConfig;
      // tuning is High to Low (e.g. E, B, G, D, A, E)
      // variation.frets is usually Low to High (e.g. E, A, D, G, B, E)
      // So we need to map correctly.

      // Process each string in the chord
      if (instrumentConfig.type === 'keyboard') {
        // For piano, we need to handle chord playback differently if we had chord data.
        // But since we don't have piano chord data yet, this part might not be reached for variations.
        // If we want to play the 'selectedChord' (which is just notes), we use playSelectedChord.
        return;
      }

      variation.frets.forEach((fret, stringIndex) => {
        if (fret !== -1) { // -1 means string is not played
          // stringIndex 0 in variation.frets corresponds to the LAST element in our tuning array (Low string)
          const tuningIndex = tuning.length - 1 - stringIndex;
          const stringNote = tuning[tuningIndex];
          const baseOctave = octaves ? octaves[tuningIndex] : 3;

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
  }, [audioInitialized, isPlaying, instrumentConfig]);

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

    // Store the currently selected chord before playing all chords
    const previouslySelectedChord = selectedChord;
    const previouslySelectedChordName = selectedChordName;

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
      // Reset after playing is complete and restore the previously selected chord
      setTimeout(() => {
        setPlayingAllChords(false);
        setCurrentChordIndex(null);

        // Restore the previously selected chord
        if (previouslySelectedChord) {
          setSelectedChord(previouslySelectedChord);
          setSelectedChordName(previouslySelectedChordName);
          onChordSelect(previouslySelectedChord);
        }
      }, 500);
    }
  };

  if (!rootNote || !selectedScale) {
    return <div className="chord-visualizer"><p>Please select a scale.</p></div>;
  }

  const { category, name } = selectedScale;
  const scaleChords = SCALE_LIBRARY[category][name];
  const chordTypes = CHORD_TYPES[category];

  // Memoize scale notes calculation to avoid recalculating on every render
  const scaleNotes = useMemo(() => {
    return getScaleNotes(rootNote, scaleChords);
  }, [rootNote, scaleChords]);

  // Prepare instrument object for react-chords
  // tuning is High to Low, react-chords expects Low to High
  // Memoized to prevent re-renders of ChordComponent
  const instrument = useMemo(() => ({
    strings: instrumentConfig ? instrumentConfig.strings : 6,
    fretsOnChord: 4,
    name: instrumentConfig ? instrumentConfig.label : 'Guitar',
    keys: [],
    tunings: {
      standard: instrumentConfig && instrumentConfig.tuning ? [...instrumentConfig.tuning].reverse() : ['E', 'A', 'D', 'G', 'B', 'E']
    }
  }), [instrumentConfig]);

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
                  <th key={index}>{getRomanNumeral(index + 1)}</th>
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
                  {instrumentConfig.type === 'keyboard' ? (
                    <div className="p-4 bg-gray-100 rounded text-center">
                      Piano chord visualization coming soon
                    </div>
                  ) : (
                    <ChordComponent
                      variation={variation}
                      instrument={instrument}
                      onPlayChord={playChordVariation}
                    />
                  )}
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
  instrumentConfig: PropTypes.object
};

export default ChordVisualizer;
