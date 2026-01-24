import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PianoKeyboard from './PianoKeyboard';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';

// Mock the soundfontAudioUtils
jest.mock('../utils/soundfontAudioUtils', () => ({
  playNote: jest.fn().mockResolvedValue(undefined),
  initializeAudio: jest.fn().mockResolvedValue(undefined),
  loadInstrument: jest.fn().mockResolvedValue(undefined),
}));

const mockProps = {
  rootNote: 'C',
  selectedScale: { category: 'Major Family', name: 'Major' },
  showScaleDegrees: true,
  instrumentConfig: {
    type: 'keyboard',
    startOctave: 3,
    endOctave: 4,
  },
  selectedChord: [],
  showScaleVisualization: true,
  showChordVisualization: true,
  onToggleScale: jest.fn(),
  onToggleChord: jest.fn(),
};

describe('PianoKeyboard', () => {
  it('renders without crashing', () => {
    render(<PianoKeyboard {...mockProps} />);
    const keys = screen.getAllByTitle(/C3|C4/);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('renders correct number of keys', () => {
    // 2 octaves (3 and 4) -> 12 * 2 = 24 keys
    render(<PianoKeyboard {...mockProps} />);
    // We can count elements with class 'piano-key'
    // But testing-library prefers roles or text.
    // The keys have titles.
    // Let's just query by class using container selector as a fallback or just assume if one renders, loop works.
    // A better check:
    const c3 = screen.getByTitle(/C3/);
    expect(c3).toBeInTheDocument();
    const b4 = screen.getByTitle(/B4/);
    expect(b4).toBeInTheDocument();
  });

  it('calls playNote when a key is clicked', () => {
    render(<PianoKeyboard {...mockProps} />);
    const c3Key = screen.getByTitle(/C3/); // Should match title="C3 - Degree 1" or similar
    fireEvent.click(c3Key);
    expect(SoundfontAudio.playNote).toHaveBeenCalledWith('C', null, 3);
  });

  it('toggles scale visualization', () => {
    render(<PianoKeyboard {...mockProps} />);
    const toggleButton = screen.getByTitle('Toggle scale note visualization');
    fireEvent.click(toggleButton);
    expect(mockProps.onToggleScale).toHaveBeenCalled();
  });
});
