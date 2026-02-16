import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
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
    jest.useFakeTimers();
    jest.clearAllMocks();
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
  });

  test('does not render if props are missing', () => {
    const { container } = render(<ScaleNotes rootNote="" selectedScale={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('clicking a note button triggers visual feedback', async () => {
    render(<ScaleNotes {...mockProps} />);

    // Wait for initial audio load effect (though mocked, it's async)
    await act(async () => {
      await Promise.resolve();
    });

    // Find the first note button (C)
    // The notes are C, D, E, F, G, A, B
    // We target the specific button in the table cell
    const buttons = screen.getAllByText('C').filter(el => el.tagName === 'BUTTON');
    const noteButton = buttons[0];
    const noteCell = noteButton.closest('td');

    // Initial state: transparent background, scale 1
    expect(noteCell).toHaveStyle({ backgroundColor: 'transparent' });
    expect(noteCell).toHaveStyle({ transform: 'scale(1)' });

    // Click the note
    await act(async () => {
      fireEvent.click(noteButton);
    });

    // Expect visual feedback
    expect(noteCell).toHaveStyle({ backgroundColor: 'rgba(59, 130, 246, 0.2)' });
    expect(noteCell).toHaveStyle({ transform: 'scale(1.1)' });

    // Verify playNote was called
    expect(SoundfontAudio.playNote).toHaveBeenCalledWith('C');

    // Fast-forward time to reset visual state (500ms is the expected timeout)
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Expect visual feedback to be gone
    expect(noteCell).toHaveStyle({ backgroundColor: 'transparent' });
    expect(noteCell).toHaveStyle({ transform: 'scale(1)' });
  });
});
