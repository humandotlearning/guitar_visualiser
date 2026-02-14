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

  test('provides visual feedback when a note is clicked', async () => {
    jest.useFakeTimers();
    await act(async () => {
      render(<ScaleNotes {...mockProps} />);
    });

    // Find the button for note 'C' (first note in C Major)
    // Note: The previous test used getAllByText('C'), but here we want the specific button
    const cNoteButton = screen.getByRole('button', { name: 'Play note C' });

    // Verify it is enabled (audio initialized)
    expect(cNoteButton).not.toBeDisabled();

    // Verify initial style (transparent)
    // The style is on the parent td
    const td = cNoteButton.closest('td');
    expect(td).toHaveStyle('background-color: transparent');

    // Click the button
    await act(async () => {
      fireEvent.click(cNoteButton);
    });

    // Check if background changed to highlight color
    expect(td).toHaveStyle('background-color: rgba(59, 130, 246, 0.2)');

    // Fast-forward time to end the visual feedback
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Check if background reverted to transparent
    expect(td).toHaveStyle('background-color: transparent');

    jest.useRealTimers();
  });
});
