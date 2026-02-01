import React, { useState, lazy, Suspense, useCallback } from 'react';
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

  const handleInstrumentChange = useCallback((e) => {
    setSelectedInstrument(e.target.value);
  }, []);

  const handleToggleScaleOnPiano = useCallback(() => {
    setShowScaleOnPiano(prev => !prev);
  }, []);

  const handleToggleChordOnPiano = useCallback(() => {
    setShowChordOnPiano(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Orientation prompt will only show on mobile devices in portrait mode */}
      <OrientationPrompt />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 md:sticky md:top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 m-0 tracking-tight">
            <span className="text-blue-600">{instrumentConfig.label}</span> Visualizer
          </h1>
          <a
            href="https://www.buymeacoffee.com/nithinvargw"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <img
              src="https://cdn.buymeacoffee.com/buttons/v2/arial-yellow.png"
              alt="Buy Me A Coffee"
              style={{ height: '40px', width: 'auto' }}
            />
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Compact Instrument Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div className="relative flex-grow sm:flex-grow-0">
              <select
                id="instrument-select"
                value={selectedInstrument}
                onChange={handleInstrumentChange}
                className="appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-8 cursor-pointer font-bold"
                style={{ minWidth: 180 }}
              >
                {Object.entries(INSTRUMENTS).map(([key, inst]) => (
                  <option key={key} value={key}>{inst.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="hidden sm:block text-xs text-slate-400 font-medium uppercase tracking-wide">
            Select Instrument
          </div>
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
        {
          theoryMode === 'Circle of Fifths' && (
            <Suspense fallback={<div className="card mt-4 p-4">Loading Circle of Fifths...</div>}>
              <div className="card mt-4">
                <CircleOfFifths
                  rootNote={rootNote}
                  setRootNote={setRootNote}
                  selectedScale={selectedScale}
                />
              </div>
            </Suspense>
          )
        }

        {
          theoryMode === 'Chord Progressions' && (
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
          )
        }

        {
          theoryMode === 'Harmonic Functions' && (
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
          )
        }

        {
          theoryMode === 'CAGED System' && (
            <Suspense fallback={<div className="card mt-4 p-4">Loading CAGED System...</div>}>
              <div className="card mt-4">
                <CAGEDSystem
                  rootNote={rootNote}
                  instrumentConfig={instrumentConfig}
                />
              </div>
            </Suspense>
          )
        }

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
                onToggleScale={handleToggleScaleOnPiano}
                onToggleChord={handleToggleChordOnPiano}
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
        {
          theoryMode === 'Scales & Chords' && (
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
          )
        }
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
                readOnly={true}
              />
            )}
          </div>
        </Suspense>
        <footer className="text-center text-slate-400 text-sm mt-12 pb-4 border-t border-slate-200 pt-8">
          <p>&copy; {new Date().getFullYear()} {instrumentConfig.label} Scale and Chord Visualizer</p>
          <p className="mt-2 text-xs">Designed for musicians, by musicians.</p>
        </footer>
      </main >
    </div >
  );
}

export default App;
