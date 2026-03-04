import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
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

  describe('Copy to Clipboard', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(),
        },
      });
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    test('copies notes to clipboard and shows feedback', async () => {
      render(<ScaleNotes {...mockProps} />);

      const copyBtn = screen.getByRole('button', { name: 'Copy scale notes to clipboard' });
      expect(copyBtn).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(copyBtn);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('C, D, E, F, G, A, B');

      // Check feedback state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Copied scale notes' })).toBeInTheDocument();
      });

      // Fast forward timers to reset state
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Copy scale notes to clipboard' })).toBeInTheDocument();
      });
    });
  });
});
