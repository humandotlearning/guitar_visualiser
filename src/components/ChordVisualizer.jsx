import React, { useEffect, useState } from 'react';
import { getChordNotes, CHORD_TYPES, SCALE_LIBRARY, getScaleNotes } from '../utils/musicTheory';
import PropTypes from 'prop-types';
import ClientOnly from '../utils/clientOnly';

// Dynamically import the Chord component to avoid SSR issues
const ChordComponent = ({ variation, instrument }) => {
  const [Chord, setChord] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@tombatossals/react-chords/lib/Chord').then((module) => {
        setChord(() => module.default);
      });
    }
  }, []);

  if (!Chord) return <div className="h-24 w-full bg-gray-100 animate-pulse rounded"></div>;
  return <Chord chord={variation} instrument={instrument} lite={false} />;
};

ChordComponent.propTypes = {
  variation: PropTypes.object.isRequired,
  instrument: PropTypes.object.isRequired
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

const ChordVisualizer = ({ rootNote, selectedScale, onChordSelect }) => {
  const [chords, setChords] = useState({});
  const [selectedChord, setSelectedChord] = useState(null);
  const [chordVariations, setChordVariations] = useState([]);
  const [guitarChordsData, setGuitarChordsData] = useState(null);

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
    }
  }, [rootNote, selectedScale]);

  useEffect(() => {
    if (selectedChord && guitarChordsData) {
      const chordName = Object.keys(chords).find(key => chords[key] === selectedChord);
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

  if (!rootNote || !selectedScale) {
    return <div className="card mt-4"><h2 className="text-xl font-semibold mb-2">Chords in the Scale</h2><p>Please select a scale.</p></div>;
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
    <ClientOnly fallback={<div className="card mt-4 p-4">Loading chord visualizer...</div>}>
      <div className="card mt-4">
        <h2 className="text-xl font-semibold mb-2">Chords in the Scale</h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            <thead>
              <tr>
                {scaleNotes.map((note, index) => (
                  <th key={index} className="px-4 py-2">{note}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.keys(chords).map((chordRoot, index) => (
                  <td key={index} className="border px-4 py-2">
                    <button
                      onClick={() => {
                        onChordSelect(chords[chordRoot]);
                        setSelectedChord(chords[chordRoot]);
                      }}
                      className={`${
                        selectedChord === chords[chordRoot] ? 'selected-chord' : ''
                      }`}
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
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        {selectedChord && chordVariations.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {chordVariations.map((variation, index) => (
              <div key={index}>
                <h3>Variation {index + 1}</h3>
                <ChordComponent variation={variation} instrument={instrument} />
              </div>
            ))}
          </div>
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
};

export default ChordVisualizer;
