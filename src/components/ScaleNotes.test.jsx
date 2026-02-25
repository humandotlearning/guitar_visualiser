import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ScaleNotes from './ScaleNotes';

// Mock the soundfontAudioUtils to avoid audio context errors
jest.mock('../utils/soundfontAudioUtils', () => ({
  initializeAudio: jest.fn().mockResolvedValue(),
  loadInstrument: jest.fn().mockResolvedValue(),
  playNote: jest.fn().mockResolvedValue(),
}));

// Mock navigator.clipboard
const writeTextMock = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: writeTextMock,
  },
});

describe('ScaleNotes', () => {
  const mockProps = {
    rootNote: 'C',
    selectedScale: { category: 'Major Family', name: 'Major' },
    selectedInstrument: 'acoustic_guitar_steel'
  };

  beforeEach(() => {
    writeTextMock.mockClear();
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

  test('copies notes to clipboard when copy button is clicked', async () => {
    writeTextMock.mockResolvedValueOnce();

    render(<ScaleNotes {...mockProps} />);

    // Find the copy button by aria-label
    const copyButton = screen.getByLabelText('Copy notes to clipboard');
    expect(copyButton).toBeInTheDocument();

    // Click the button
    await act(async () => {
      fireEvent.click(copyButton);
    });

    // Check if writeText was called with correct notes (comma separated)
    expect(writeTextMock).toHaveBeenCalledWith('C, D, E, F, G, A, B');

    // Check if aria-label changed (to indicate success)
    expect(screen.getByLabelText('Notes copied')).toBeInTheDocument();

    // Fast-forward time
    act(() => {
        jest.advanceTimersByTime(2000);
    });

    // Should revert
    expect(screen.getByLabelText('Copy notes to clipboard')).toBeInTheDocument();
  });
});
