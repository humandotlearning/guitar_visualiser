import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ScaleNotes from './ScaleNotes';

// Mock the soundfontAudioUtils to avoid audio context errors
jest.mock('../utils/soundfontAudioUtils', () => ({
  initializeAudio: jest.fn().mockResolvedValue(),
  loadInstrument: jest.fn().mockResolvedValue(),
  playNote: jest.fn().mockResolvedValue(),
}));

describe('ScaleNotes', () => {
  const mockProps = {
    rootNote: 'C',
    selectedScale: { category: 'Major Family', name: 'Major' },
    selectedInstrument: 'acoustic_guitar_steel'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with given props', () => {
    render(<ScaleNotes {...mockProps} />);

    // Check title
    expect(screen.getByText('Notes of C Major')).toBeInTheDocument();

    // Check pattern
    // Major scale pattern intervals between 7 notes: W W H W W W
    expect(screen.getByText('W W H W W W')).toBeInTheDocument();

    // Check notes
    const expectedNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    expectedNotes.forEach(note => {
      // Notes should now be in buttons
      expect(screen.getByRole('button', { name: `Play note ${note}` })).toBeInTheDocument();
    });
  });

  test('does not render if props are missing', () => {
    const { container } = render(<ScaleNotes rootNote="" selectedScale={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('plays individual note with correct octave when clicked', () => {
    const { playNote } = require('../utils/soundfontAudioUtils');
    render(<ScaleNotes {...mockProps} />);

    // Click 'C' (octave 4)
    const cButton = screen.getByRole('button', { name: 'Play note C' });
    fireEvent.click(cButton);
    expect(playNote).toHaveBeenCalledWith('C', null, 4);

    // Click 'B' (octave 4)
    const bButton = screen.getByRole('button', { name: 'Play note B' });
    fireEvent.click(bButton);
    expect(playNote).toHaveBeenCalledWith('B', null, 4);
  });

  test('calculates correct octaves for wrapped scale (B Major)', () => {
    const { playNote } = require('../utils/soundfontAudioUtils');
    // B Major: B, C#, D#, E, F#, G#, A#
    const bMajorProps = {
      ...mockProps,
      rootNote: 'B',
      selectedScale: { category: 'Major Family', name: 'Major' }
    };
    render(<ScaleNotes {...bMajorProps} />);

    // Click 'B' (octave 4)
    const bButton = screen.getByRole('button', { name: 'Play note B' });
    fireEvent.click(bButton);
    expect(playNote).toHaveBeenCalledWith('B', null, 4);

    // Click 'C#' (should be octave 5 because C# index < B index)
    const cSharpButton = screen.getByRole('button', { name: 'Play note C#' });
    fireEvent.click(cSharpButton);
    expect(playNote).toHaveBeenCalledWith('C#', null, 5);
  });
});
