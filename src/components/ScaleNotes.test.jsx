import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScaleNotes from './ScaleNotes';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';

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
    expect(screen.getByText('W W H W W W')).toBeInTheDocument();

    // Check notes
    const expectedNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    expectedNotes.forEach(note => {
      const elements = screen.getAllByText(note);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  test('does not render if props are missing', () => {
    const { container } = render(<ScaleNotes rootNote="" selectedScale={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders interactive note buttons', () => {
    render(<ScaleNotes {...mockProps} />);

    const expectedNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    expectedNotes.forEach((note, index) => {
      const button = screen.getByRole('button', { name: `Play ${note}, degree ${index + 1}` });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('hover:bg-slate-100');
    });
  });

  test('plays note when clicked', async () => {
    render(<ScaleNotes {...mockProps} />);

    // Wait for audio initialization (indicated by Play Scale button becoming enabled)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Play Scale' })).not.toBeDisabled();
    });

    // Click the first note (C)
    const noteButton = screen.getByRole('button', { name: 'Play C, degree 1' });
    userEvent.click(noteButton);

    expect(SoundfontAudio.playNote).toHaveBeenCalledWith('C');

    // Click another note (G)
    const gButton = screen.getByRole('button', { name: 'Play G, degree 5' });
    userEvent.click(gButton);

    expect(SoundfontAudio.playNote).toHaveBeenCalledWith('G');
  });
});
