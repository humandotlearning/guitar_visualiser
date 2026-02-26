import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

  beforeAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(),
      },
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
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
      // Use getAllByText because notes might appear in multiple places (though here mostly in table)
      const elements = screen.getAllByText(note);
      expect(elements.length).toBeGreaterThan(0);
    });

    // Check for copy button
    expect(screen.getByRole('button', { name: /copy scale notes to clipboard/i })).toBeInTheDocument();
  });

  test('does not render if props are missing', () => {
    const { container } = render(<ScaleNotes rootNote="" selectedScale={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('copies notes to clipboard when copy button is clicked', async () => {
    render(<ScaleNotes {...mockProps} />);

    const copyButton = screen.getByRole('button', { name: /copy scale notes to clipboard/i });

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // Verify clipboard writeText was called with correct notes
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('C, D, E, F, G, A, B');

    // Verify visual feedback
    expect(screen.getByText('Copied!')).toBeInTheDocument();

    // Verify it reverts after timeout
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });
});
