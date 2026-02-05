import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getChordNotes, CHORD_TYPES, SCALE_LIBRARY, getScaleNotes } from '../utils/musicTheory';
import PropTypes from 'prop-types';
import ClientOnly from '../utils/clientOnly';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';
import './ChordVisualizer.css';

// Dynamically import the Chord component to avoid SSR issues
const ChordComponent = React.memo(({ variation, instrument, onPlayChord, label, Chord }) => {
  const handleClick = () => {
    onPlayChord(variation);
  };

  if (!Chord) return <div className="h-24 w-full bg-gray-100 animate-pulse rounded"></div>;
  return (
    <button
      type="button"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
      title="Click to play chord"
      className="w-full bg-transparent border-0 p-0 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      aria-label={label}
    >
      <Chord chord={variation} instrument={instrument} lite={false} />
    </button>
  );
});

ChordComponent.displayName = 'ChordComponent';

ChordComponent.propTypes = {
  variation: PropTypes.object.isRequired,
  instrument: PropTypes.object.isRequired,
  onPlayChord: PropTypes.func.isRequired,
  label: PropTypes.string,
  Chord: PropTypes.elementType
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
  // Load the Chord component library once
  const [ChordLibrary, setChordLibrary] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@tombatossals/react-chords/lib/Chord').then((module) => {
        setChordLibrary(() => module.default);
      });
    }
  }, []);

  // Derived state: calculate chords directly in render
  const chords = useMemo(() => {
    if (rootNote && selectedScale) {
      return getChordNotes(rootNote, selectedScale);
    }
    return {};
  }, [rootNote, selectedScale]);

  // Track user selection. If null, we default to root chord.
  const [internalSelectedChordName, setInternalSelectedChordName] = useState(null);

  // State to track props for reset on change (mimics original behavior)
  const [prevProps, setPrevProps] = useState({ rootNote, selectedScale });

  // Reset selection if scale/root changes
  if (prevProps.rootNote !== rootNote || prevProps.selectedScale !== selectedScale) {
    setPrevProps({ rootNote, selectedScale });
    setInternalSelectedChordName(null);
  }

  // Track chord data loaded from JSON
  const [chordData, setChordData] = useState(null);

  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [lastTapChord, setLastTapChord] = useState(null);
  const [playingAllChords, setPlayingAllChords] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(null);

  // Derive selected chord name and object
  // Logic:
  // 1. If we have a user selection AND it exists in the current chords (e.g. scale didn't remove it), use it.
  // 2. Otherwise, default to the first chord (root) of the current scale.
  // 3. If chords is empty (no scale), selected is null.
  const rootChordName = Object.keys(chords)[0];

  // Effective name is the one we display
  let selectedChordName = rootChordName;
  if (internalSelectedChordName && chords[internalSelectedChordName]) {
    selectedChordName = internalSelectedChordName;
  }

  // Special case: if user explicitly deselected (e.g. set to ''), we might want to support that.
  // But current logic is "Deselect" -> setInternal to 'EMPTY' maybe?
  // The original code set selectedChord to [].
  // Let's support 'EMPTY' state if needed, but for now we default to root unless explicit deselect logic is added.
  // Wait, original 'Deselect' logic: onChordSelect([]), setSelectedChord([]).
  // If we want to support 'No Selection', we need to check if internalSelectedChordName is 'NONE'.

  // Let's implement 'NONE' support
  if (internalSelectedChordName === 'NONE') {
    selectedChordName = null;
  }

  const selectedChord = selectedChordName ? chords[selectedChordName] : null;

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

  // Sync selected chord with parent
  useEffect(() => {
    // Only call onChordSelect if selectedChord is defined (or explicitly null/empty)
    // The parent expects array or empty array
    onChordSelect(selectedChord || []);
  }, [selectedChord, onChordSelect]);

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

  // Calculate variations - Derived state using useMemo to avoid extra render
  const chordVariations = useMemo(() => {
    if (selectedChordName && chordData && selectedScale && selectedChord) {
      const chordName = selectedChordName;

      const chordTypeIndex = Object.keys(chords).indexOf(chordName);
      const chordType = CHORD_TYPES[selectedScale.category][chordTypeIndex] || 'major';
      const chordSuffix = CHORD_TYPE_MAP[chordType] || chordType;

      // Map chord name to JSON key
      const jsonKey = mapChordNameToJsonKey(chordName);
      const chordInfo = chordData.chords[jsonKey]?.find(chord => chord.suffix === chordSuffix);

      return chordInfo ? chordInfo.positions : [];
    }
    return [];
  }, [selectedChordName, selectedChord, chords, selectedScale, chordData]);

  // Handle double tap to select and play chord
  const handleChordTap = (chordRoot) => {
    const now = Date.now();
    const doubleTapThreshold = 300; // ms

    // Check if clicking the same chord that's already selected
    const isSameChord = selectedChordName === chordRoot;

    if (isSameChord) {
      // Deselect the chord
      setInternalSelectedChordName('NONE');
      setLastTapTime(0);
      setLastTapChord(null);
      return;
    }

    // Update the selected chord
    setInternalSelectedChordName(chordRoot);

    // Check if it's a double tap on the same chord
    if (now - lastTapTime < doubleTapThreshold && lastTapChord === chordRoot) {
      // It's a double tap, so play the chord
      playSelectedChord();
    }

    setLastTapTime(now);
    setLastTapChord(chordRoot);
  };

  // Play a specific chord (helper for the individual play buttons)
  const playSpecificChord = async (chordNotes) => {
    if (!audioInitialized || isPlaying || !chordNotes) return;

    setIsPlaying(true);
    try {
      await SoundfontAudio.playChord(chordNotes);
      setTimeout(() => setIsPlaying(false), 1500);
    } catch (error) {
      console.error('Error playing chord:', error);
      setIsPlaying(false);
    }
  };

  // Play a chord based on variation
  const playChordVariation = useCallback(async (variation) => {
    if (!audioInitialized || isPlaying || !instrumentConfig) return;

    setIsPlaying(true);
    try {
      const notes = [];
      const { tuning, octaves } = instrumentConfig;

      if (instrumentConfig.type === 'keyboard') {
        return;
      }

      variation.frets.forEach((fret, stringIndex) => {
        if (fret !== -1) {
          const tuningIndex = tuning.length - 1 - stringIndex;
          const stringNote = tuning[tuningIndex];
          const baseOctave = octaves ? octaves[tuningIndex] : 3;

          const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
          const noteIndex = (NOTES.indexOf(stringNote) + fret) % 12;
          const note = NOTES[noteIndex];

          const octaveShift = Math.floor((NOTES.indexOf(stringNote) + fret) / 12);
          const octave = baseOctave + octaveShift;

          notes.push({ note, octave });
        }
      });

      await Promise.all(notes.map(({ note, octave }) =>
        SoundfontAudio.playNote(note, null, octave)
      ));

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

    const previouslySelectedChordName = selectedChordName;

    setPlayingAllChords(true);
    try {
      const chordKeys = Object.keys(chords);
      for (let i = 0; i < chordKeys.length; i++) {
        const chordKey = chordKeys[i];
        setCurrentChordIndex(i);
        setInternalSelectedChordName(chordKey); // Update selection via state

        await SoundfontAudio.playChord(chords[chordKey]);

        if (i < chordKeys.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (err) {
      console.error('Error playing chords:', err);
    } finally {
      setTimeout(() => {
        setPlayingAllChords(false);
        setCurrentChordIndex(null);

        if (previouslySelectedChordName) {
          setInternalSelectedChordName(previouslySelectedChordName);
        } else if (previouslySelectedChordName === null && previouslySelectedChordName === 'NONE') {
            setInternalSelectedChordName('NONE');
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

  // Memoize scale notes calculation
  // We can actually assume scaleNotes is just keys of chords?
  // chords keys are roots. But order matters.
  // getScaleNotes returns array of notes.
  // getChordNotes returns object { Note: [...] }
  // Object keys might not be in order?
  // getChordNotes implementation iterates scale and adds keys.
  // JS Object keys are ordered if string keys.
  // But safer to rely on scaleNotes array for ordering.
  const scaleNotes = useMemo(() => {
    return getScaleNotes(rootNote, scaleChords);
  }, [rootNote, scaleChords]);

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
                  const isSelected = selectedChordName === chordRoot;
                  const isPlaying = currentChordIndex === index && playingAllChords;
                  return (
                    <td key={index}>
                      <button
                        onClick={() => handleChordTap(chordRoot)}
                        className={`chord-button ${isSelected ? 'selected-chord' : ''} ${isPlaying ? 'playing-chord' : ''}`}
                        title="Click to select"
                      >
                        {chordRoot}{chordTypes[index]}
                      </button>
                      <div className="chord-notes">
                        {chords[chordRoot].join(', ')}
                      </div>
                      <div className="chord-degree">
                        {index + 1} {chordTypes[index]}
                      </div>
                      {isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playSpecificChord(chords[chordRoot]);
                          }}
                          className="play-button w-full mt-2"
                          disabled={isPlaying || !audioInitialized}
                          aria-label={`Play ${chordRoot} ${chordTypes[index]} chord`}
                        >
                          ▶ Play
                        </button>
                      )}
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
                      label={`Play variation ${index + 1}`}
                      Chord={ChordLibrary}
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

export default React.memo(ChordVisualizer);
