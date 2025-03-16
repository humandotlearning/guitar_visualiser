import React, { useState, lazy, Suspense } from 'react';
// Lazy load the larger components
const Fretboard = lazy(() => import('./components/Fretboard'));
const ChordVisualizer = lazy(() => import('./components/ChordVisualizer'));
const AudioPlayback = lazy(() => import('./components/AudioPlayback'));
const FretboardCustomization = lazy(() => import('./components/FretboardCustomization'));
// Keep smaller components eagerly loaded
import ScaleSelector from './components/ScaleSelector';
import ScaleNotes from './components/ScaleNotes';  
import { getScaleNotes, SCALE_LIBRARY } from './utils/musicTheory';
import './App.css';

const App = () => {

  const defaultRootNote = 'A';
  const defaultSelectedScale = { category: 'Pentatonic', name: 'Minor Pentatonic' };


  const [rootNote, setRootNote] = useState(defaultRootNote);
  const [selectedScale, setSelectedScale] = useState(defaultSelectedScale);
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
          <h2 className="text-xl font-semibold mb-2">Select Scale</h2>
          <ScaleSelector
            rootNote={rootNote}
            setRootNote={setRootNote}
            selectedScale={selectedScale}
            setSelectedScale={setSelectedScale}
          />
          
        </div> 
      </div>
      <div className="card">
          {/* <h2 className="text-xl font-semibold mb-2">Scale </h2> */}
      <ScaleNotes rootNote={rootNote} selectedScale={selectedScale} />
      </div>
      <Suspense fallback={<div className="card mt-4 p-4">Loading Fretboard...</div>}>
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
      </Suspense>
      <Suspense fallback={<div className="card mt-4 p-4">Loading Chord Visualizer...</div>}>
        <div className="card mt-4">
          {/* <h2 className="text-xl font-semibold mb-2">Chords in the Scale</h2> */}
          <ChordVisualizer
            rootNote={rootNote}
            selectedScale={selectedScale}
            onChordSelect={setSelectedChord}
          />
        </div>
      </Suspense>
      <Suspense fallback={<div className="card mt-4 p-4">Loading Audio Playback...</div>}>
        <div className="card mt-4">
          <AudioPlayback scaleNotes={scaleNotes} chordNotes={selectedChord} />
        </div>
      </Suspense>
      <Suspense fallback={<div className="card p-4">Loading Customization...</div>}>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Fretboard Customization</h2>
          <FretboardCustomization
            tuning={tuning}
            setTuning={setTuning}
            fretCount={fretCount}
            setFretCount={setFretCount}
          />
        </div>
      </Suspense>
    </div>
  );
};

export default App;
