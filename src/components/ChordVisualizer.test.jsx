import { render, screen, act, waitFor } from '@testing-library/react';
import ChordVisualizer from './ChordVisualizer';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';

// Mock audio utils
jest.mock('../utils/soundfontAudioUtils', () => ({
  initializeAudio: jest.fn().mockResolvedValue({}),
  loadInstrument: jest.fn().mockResolvedValue({}),
  playNote: jest.fn().mockResolvedValue(),
  playChord: jest.fn().mockResolvedValue(),
  setVolumeBoost: jest.fn(),
}));

// Mock dynamic import for react-chords
jest.mock('@tombatossals/react-chords/lib/Chord', () => {
    return {
        __esModule: true,
        default: () => <div data-testid="mock-chord-diagram">Chord Diagram</div>
    };
}, { virtual: true });


const mockInstrumentConfig = {
  label: 'Guitar',
  type: 'strings',
  strings: 6,
  tuning: ['E', 'B', 'G', 'D', 'A', 'E'],
  octaves: [4, 3, 3, 3, 2, 2],
  soundfontName: 'acoustic_guitar_steel',
  chordDataKey: 'guitar',
};

const defaultProps = {
  rootNote: 'C',
  selectedScale: { category: 'Major Family', name: 'Major' },
  onChordSelect: jest.fn(),
  instrumentConfig: mockInstrumentConfig,
};

// Mock the guitar.json import
jest.mock('../db/guitar.json', () => ({
  __esModule: true,
  default: {
    chords: {
      C: [
        {
          suffix: 'major',
          positions: [
            { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], barres: [] },
            { frets: [3, 3, 5, 5, 5, 3], fingers: [1, 1, 3, 3, 3, 1], barres: [3] }
          ]
        }
      ]
    }
  }
}), { virtual: true });


test('renders chord variations as accessible buttons', async () => {
  await act(async () => {
    render(<ChordVisualizer {...defaultProps} />);
  });

  // Wait for the variations to appear (loaded from mock json)
  // The component defaults to first chord (C major) if scale is selected.
  await waitFor(() => {
    expect(screen.getByText('Variation 1')).toBeInTheDocument();
  });

  // Check if variations are buttons
  // This expectation should fail initially
  const variations = screen.getAllByRole('button', { name: /Play variation/i });
  expect(variations.length).toBeGreaterThan(0);
  expect(variations[0]).toHaveAttribute('type', 'button');
});
