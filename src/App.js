import React, { useState, lazy, Suspense } from 'react';
import INSTRUMENTS from './instruments';
// Lazy load the larger components
const Fretboard = lazy(() => import('./components/Fretboard'));
const PianoKeyboard = lazy(() => import('./components/PianoKeyboard'));
const ChordVisualizer = lazy(() => import('./components/ChordVisualizer'));
const AudioPlayback = lazy(() => import('./components/AudioPlayback'));
const FretboardCustomization = lazy(() => import('./components/FretboardCustomization'));
// Lazy load theory components
const CircleOfFifths = lazy(() => import('./components/theory/CircleOfFifths'));
const ChordProgressions = lazy(() => import('./components/theory/ChordProgressions'));
const HarmonicFunctions = lazy(() => import('./components/theory/HarmonicFunctions'));
const CAGEDSystem = lazy(() => import('./components/theory/CAGEDSystem'));
// Keep smaller components eagerly loaded
import ScaleSelector from './components/ScaleSelector';
import ScaleNotes from './components/ScaleNotes';
import OrientationPrompt from './components/OrientationPrompt';
import TheoryModeSelector from './components/theory/TheoryModeSelector';
import './App.css';

function App() {

  const defaultRootNote = 'A';
  const defaultSelectedScale = { category: 'Pentatonic', name: 'Minor Pentatonic' };
  const defaultSelectedInstrument = 'acoustic_guitar_steel';

  const [rootNote, setRootNote] = useState(defaultRootNote);
  const [selectedScale, setSelectedScale] = useState(defaultSelectedScale);
  const [showScaleDegrees, setShowScaleDegrees] = useState(false);
  const [selectedChord, setSelectedChord] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState(defaultSelectedInstrument);
  const [showScaleOnPiano, setShowScaleOnPiano] = useState(true);
  const [showChordOnPiano, setShowChordOnPiano] = useState(true);
  // Theory mode state
  const [theoryMode, setTheoryMode] = useState('Scales & Chords');

  // Derived instrument data (fallback to guitar if unknown)
  const instrumentConfig = INSTRUMENTS[selectedInstrument] || INSTRUMENTS['acoustic_guitar_steel'];

  const handleInstrumentChange = (e) => {
    setSelectedInstrument(e.target.value);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Orientation prompt will only show on mobile devices in portrait mode */}
      <OrientationPrompt />

      <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="text-3xl font-bold">{instrumentConfig.label} Scale and Chord Visualizer</h1>
        <a href="https://www.buymeacoffee.com/nithinvargw" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.buymeacoffee.com/buttons/v2/arial-yellow.png" alt="Buy Me A Coffee" style={{ height: '50px', width: '180px' }} />
        </a>
      </div>
      {/* Instrument Selector */}
      <div className="instrument-selector card mb-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem' }}>
        <label htmlFor="instrument-select" className="font-semibold">Instrument:</label>
        <select
          id="instrument-select"
          value={selectedInstrument}
          onChange={handleInstrumentChange}
          className="rounded border px-2 py-1"
          style={{ minWidth: 120 }}
        >
          {Object.entries(INSTRUMENTS).map(([key, inst]) => (
            <option key={key} value={key}>{inst.label}</option>
          ))}
        </select>
      </div>

      {/* Theory Mode Selector */}
      <div className="card mb-4">
        <TheoryModeSelector
          selectedMode={theoryMode}
          setSelectedMode={setTheoryMode}
          instrumentConfig={instrumentConfig}
        />
      </div>

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
        <div className="card">
          <ScaleNotes
            rootNote={rootNote}
            selectedScale={selectedScale}
            selectedInstrument={selectedInstrument}
          />
        </div>
      </div>

      {/* Theory Visualizations */}
      {theoryMode === 'Circle of Fifths' && (
        <Suspense fallback={<div className="card mt-4 p-4">Loading Circle of Fifths...</div>}>
          <div className="card mt-4">
            <CircleOfFifths
              rootNote={rootNote}
              setRootNote={setRootNote}
              selectedScale={selectedScale}
            />
          </div>
        </Suspense>
      )}

      {theoryMode === 'Chord Progressions' && (
        <Suspense fallback={<div className="card mt-4 p-4">Loading Chord Progressions...</div>}>
          <div className="card mt-4">
            <ChordProgressions
              rootNote={rootNote}
              selectedScale={selectedScale}
              setSelectedChord={setSelectedChord}
              instrumentConfig={instrumentConfig}
            />
          </div>
        </Suspense>
      )}

      {theoryMode === 'Harmonic Functions' && (
        <Suspense fallback={<div className="card mt-4 p-4">Loading Harmonic Functions...</div>}>
          <div className="card mt-4">
            <HarmonicFunctions
              rootNote={rootNote}
              selectedScale={selectedScale}
              setSelectedChord={setSelectedChord}
              instrumentConfig={instrumentConfig}
            />
          </div>
        </Suspense>
      )}

      {theoryMode === 'CAGED System' && (
        <Suspense fallback={<div className="card mt-4 p-4">Loading CAGED System...</div>}>
          <div className="card mt-4">
            <CAGEDSystem
              rootNote={rootNote}
              instrumentConfig={instrumentConfig}
            />
          </div>
        </Suspense>
      )}

      {/* Instrument Visualization (always shown) */}
      <Suspense fallback={<div className="card mt-4 p-4">Loading Instrument...</div>}>
        <div className="card mt-4">
          {instrumentConfig.type === 'keyboard' ? (
            <PianoKeyboard
              rootNote={rootNote}
              selectedScale={selectedScale}
              showScaleDegrees={showScaleDegrees}
              instrumentConfig={instrumentConfig}
              selectedChord={selectedChord}
              showScaleVisualization={showScaleOnPiano}
              showChordVisualization={showChordOnPiano}
              onToggleScale={() => setShowScaleOnPiano(!showScaleOnPiano)}
              onToggleChord={() => setShowChordOnPiano(!showChordOnPiano)}
            />
          ) : (
            <Fretboard
              rootNote={rootNote}
              selectedScale={selectedScale}
              showScaleDegrees={showScaleDegrees}
              setShowScaleDegrees={setShowScaleDegrees}
              instrumentConfig={instrumentConfig}
              selectedInstrument={selectedInstrument}
            />
          )}

        </div>
      </Suspense>
      {/* Only show Chord Visualizer in Scales & Chords mode */}
      {theoryMode === 'Scales & Chords' && (
        <Suspense fallback={<div className="card mt-4 p-4">Loading Chord Visualizer...</div>}>
          <div className="card mt-4">
            <h2 className="text-xl font-semibold mb-2">Chords in the Scale of {rootNote} {selectedScale?.name || 'No Scale Selected'}</h2>
            <ChordVisualizer
              rootNote={rootNote}
              selectedScale={selectedScale}
              onChordSelect={setSelectedChord}
              instrumentConfig={instrumentConfig}
            />
          </div>
        </Suspense>
      )}
      <Suspense fallback={<div className="card mt-4 p-4">Loading Audio Playback...</div>}>
        <div className="card mt-4">
          <AudioPlayback
            rootNote={rootNote}
            selectedScale={selectedScale}
            selectedChord={selectedChord}
            selectedInstrument={selectedInstrument}
            onInstrumentChange={handleInstrumentChange}
          />
        </div>
      </Suspense>

      <Suspense fallback={<div className="card p-4">Loading Customization...</div>}>
        <div className="card mt-4">
          <h2 className="text-xl font-semibold mb-2">Fretboard Customization</h2>
          {instrumentConfig.type !== 'keyboard' && (
            <FretboardCustomization
              tuning={instrumentConfig.tuning}
              setTuning={() => { }}
              fretCount={instrumentConfig.fretCount}
              setFretCount={() => { }}
            />
          )}
        </div>
      </Suspense>
      <footer className="text-center text-gray-500 text-sm mt-8 mb-4">
        &copy; {new Date().getFullYear()} {instrumentConfig.label} Scale and Chord Visualizer
      </footer>
    </div>
  );
}

export default App;
