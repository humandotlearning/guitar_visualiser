import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  test('renders correctly with given props', async () => {
    render(<ScaleNotes {...mockProps} />);

    // Wait for audio initialization to avoid act warnings
    await waitFor(() => {
      // The button is disabled initially, enabled after audio init
      const playButton = screen.getByText('Play Scale').closest('button');
      expect(playButton).not.toBeDisabled();
    });

    // Check title
    expect(screen.getByText('Notes of C Major')).toBeInTheDocument();

    // Check pattern
    // Major scale pattern intervals between 7 notes: W W H W W W
    expect(screen.getByText('W W H W W W')).toBeInTheDocument();

    // Check notes
    const expectedNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    expectedNotes.forEach(note => {
      // Use getAllByText because notes might appear in multiple places (though here mostly in table)
      const elements = screen.getAllByText(note);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  test('does not render if props are missing', () => {
    const { container } = render(<ScaleNotes rootNote="" selectedScale={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('copies notes to clipboard when copy button is clicked', async () => {
    // Mock clipboard writeText
    const mockWriteText = jest.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });

    render(<ScaleNotes {...mockProps} />);

    // Wait for audio initialization
    await waitFor(() => {
      const playButton = screen.getByText('Play Scale').closest('button');
      expect(playButton).not.toBeDisabled();
    });

    // Find the copy button
    const copyButton = screen.getByLabelText('Copy scale notes to clipboard');
    expect(copyButton).toBeInTheDocument();

    // Click it
    userEvent.click(copyButton);

    // Verify clipboard was called
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('C, D, E, F, G, A, B');
    });

    // Verify feedback state (icon/label change)
    await waitFor(() => {
      expect(screen.getByLabelText('Copied scale notes')).toBeInTheDocument();
    });
  });
});
