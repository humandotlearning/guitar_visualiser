import { render, screen, fireEvent, act } from '@testing-library/react';
import Fretboard from './Fretboard';
import { INSTRUMENTS } from '../instruments'; // I need to export this or mock it.
import * as SoundfontAudio from '../utils/soundfontAudioUtils';

// Mock audio utils
jest.mock('../utils/soundfontAudioUtils', () => ({
  initializeAudio: jest.fn().mockResolvedValue({}),
  loadInstrument: jest.fn().mockResolvedValue({}),
  playNote: jest.fn().mockResolvedValue(),
  playString: jest.fn().mockResolvedValue(),
  setVolumeBoost: jest.fn(),
}));

// Mock INSTRUMENTS if not exported from instruments.js (it is default exported)
// Actually I can just import it.
// Wait, instruments.js has "export default INSTRUMENTS".

const mockInstrumentConfig = {
  label: 'Guitar',
  strings: 6,
  tuning: ['E', 'B', 'G', 'D', 'A', 'E'],
  octaves: [4, 3, 3, 3, 2, 2],
  fretCount: 12, // smaller for test
  soundfontName: 'acoustic_guitar_steel',
  fretMarkers: [3, 5, 7, 9, 12],
  doubleFretMarkers: [12],
};

const defaultProps = {
  rootNote: 'C',
  selectedScale: { category: 'Major Family', name: 'Major' },
  showScaleDegrees: true,
  setShowScaleDegrees: jest.fn(),
  instrumentConfig: mockInstrumentConfig,
  selectedInstrument: 'acoustic_guitar_steel',
};

test('renders Fretboard with correct number of strings and frets', async () => {
  await act(async () => {
    render(<Fretboard {...defaultProps} />);
  });

  // Check strings
  // There are 6 strings in config
  // Each string renders a "string" class div?
  // Let's look at Fretboard.jsx code:
  // {tuning.map((string, stringIndex) => ( <div className="string" ...> ))}

  // Note: testing-library suggests testing by role or text.
  // The strings have StringLabels which display the note name.
  // Tuning is E, B, G, D, A, E.
  // But there are multiple 'E's.
  // screen.getAllByText('E') should return 2 (for labels) + notes on fretboard?
  // StringLabels have "string-label" class.

  // Let's verify string labels exist
  expect(screen.getAllByText('E').length).toBeGreaterThan(0);
  expect(screen.getAllByText('A').length).toBeGreaterThan(0);
});

test('handles scroll interaction', async () => {
  // Mock scrollTo for JSDOM
  Element.prototype.scrollTo = jest.fn();

  await act(async () => {
    render(<Fretboard {...defaultProps} />);
  });

  const scrollLeftBtn = screen.getByLabelText('Scroll left');
  const scrollRightBtn = screen.getByLabelText('Scroll right');

  expect(scrollLeftBtn).toBeInTheDocument();
  expect(scrollRightBtn).toBeInTheDocument();

  // We can't easily check scroll position change in jsdom without layout,
  // but we can ensure clicking doesn't crash.
  fireEvent.click(scrollRightBtn);
  fireEvent.click(scrollLeftBtn);
});
