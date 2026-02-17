import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    // Mock navigator.clipboard.writeText
    const mockWriteText = jest.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
    });

    render(<ScaleNotes {...mockProps} />);

    // Find the copy button
    const copyButton = screen.getByLabelText('Copy notes to clipboard');
    expect(copyButton).toBeInTheDocument();

    // Click it
    fireEvent.click(copyButton);

    // Verify writeText was called
    expect(mockWriteText).toHaveBeenCalledWith('C, D, E, F, G, A, B');

    // Check if the button label changes (feedback)
    await waitFor(() => {
      expect(screen.getByLabelText('Copied notes to clipboard')).toBeInTheDocument();
    });
  });
});
