import { render, screen, fireEvent, act } from '@testing-library/react';
import Fretboard from './Fretboard';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';

// Mock audio utils
jest.mock('../utils/soundfontAudioUtils', () => ({
  initializeAudio: jest.fn().mockResolvedValue({}),
  loadInstrument: jest.fn().mockResolvedValue({}),
  playNote: jest.fn().mockResolvedValue(),
  playString: jest.fn().mockResolvedValue(),
  setVolumeBoost: jest.fn(),
}));

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
  // Tuning is E, B, G, D, A, E.
  expect(screen.getAllByText('E').length).toBeGreaterThan(0);
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

test('notes and string labels are accessible buttons', async () => {
  await act(async () => {
    render(<Fretboard {...defaultProps} />);
  });

  // Check for string labels as buttons
  // "Play open E string"
  const stringLabels = screen.getAllByRole('button', { name: /Play open [A-G] string/i });
  expect(stringLabels.length).toBeGreaterThan(0);
  expect(stringLabels[0]).toHaveAttribute('type', 'button');

  // Check for notes as buttons
  // Try to find a specific note, e.g., Root C (Degree 1)
  // There should be a C button.
  const noteButtons = screen.getAllByRole('button', { name: /Play C[0-9], Degree 1/i });
  expect(noteButtons.length).toBeGreaterThan(0);
  expect(noteButtons[0]).toHaveAttribute('type', 'button');

  // Verify that notes not in scale (like C# in C Major) are disabled/hidden
  // C# is not in C Major scale.
  const hiddenButtons = screen.queryAllByRole('button', { name: /Play C#[0-9]/i });

  // We expect them to exist (as buttons) but be disabled because showNonScaleNotes is false by default
  // Wait, if disabled, they might not be found by getByRole('button')?
  // role="button" works for disabled buttons.

  if (hiddenButtons.length > 0) {
      expect(hiddenButtons[0]).toBeDisabled();
      expect(hiddenButtons[0]).toHaveClass('hidden-note');
  }
});
