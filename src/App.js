import React, { useState } from 'react';
import ScaleSelector from './components/ScaleSelector';
import Fretboard from './components/Fretboard';
import ChordVisualizer from './components/ChordVisualizer';
import AudioPlayback from './components/AudioPlayback';
import FretboardCustomization from './components/FretboardCustomization';
import { getScaleNotes, SCALE_LIBRARY } from './utils/musicTheory';
import './App.css';

const App = () => {
  const [rootNote, setRootNote] = useState('C');
  const [selectedScale, setSelectedScale] = useState(null);
  const [showScaleDegrees, setShowScaleDegrees] = useState(false);
  const [tuning, setTuning] = useState(['E', 'B', 'G', 'D', 'A', 'E']);
  const [fretCount, setFretCount] = useState(24);
  const [selectedChord, setSelectedChord] = useState([]);

  const scaleNotes = selectedScale
    ? getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name])
    : [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Guitar Scale Visualizer</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card">
          <h2 className="text-xl font-semibold mb-2">Fretboard Customization</h2>
          <FretboardCustomization
            tuning={tuning}
            setTuning={setTuning}
            fretCount={fretCount}
            setFretCount={setFretCount}
          />
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Select Scale</h2>
          <ScaleSelector
            rootNote={rootNote}
            setRootNote={setRootNote}
            selectedScale={selectedScale}
            setSelectedScale={setSelectedScale}
          />
        </div> 
      </div>
      <div className="card mt-4">
        <h2 className="text-xl font-semibold mb-2">Fretboard</h2>
        <Fretboard
          rootNote={rootNote}
          selectedScale={selectedScale}
          showScaleDegrees={showScaleDegrees}
          setShowScaleDegrees={setShowScaleDegrees}
          tuning={tuning}
          fretCount={fretCount}
        />
      </div>
      <div className="card mt-4">
        <h2 className="text-xl font-semibold mb-2">Chords in the Scale</h2>
        <ChordVisualizer
          rootNote={rootNote}
          selectedScale={selectedScale}
          onChordSelect={setSelectedChord}
        />
      </div>
      <div className="card mt-4">
        <AudioPlayback scaleNotes={scaleNotes} chordNotes={selectedChord} />
      </div>
    </div>
  );
};

export default App;
