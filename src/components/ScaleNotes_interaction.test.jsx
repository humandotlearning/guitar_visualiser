import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScaleNotes from './ScaleNotes';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';

// Mock the soundfontAudioUtils
jest.mock('../utils/soundfontAudioUtils', () => ({
  initializeAudio: jest.fn().mockResolvedValue(),
  loadInstrument: jest.fn().mockResolvedValue(),
  playNote: jest.fn().mockResolvedValue(),
  setVolume: jest.fn(),
  setSustain: jest.fn(),
}));

describe('ScaleNotes Interaction', () => {
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
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('clicking a note provides visual feedback (UX improvement)', async () => {
    render(<ScaleNotes {...mockProps} />);

    // Wait for audio initialization (button becomes enabled)
    const noteButton = screen.getByRole('button', { name: /Play note C/i });
    await waitFor(() => expect(noteButton).not.toBeDisabled());

    const noteCell = noteButton.closest('td');

    // Initial state
    expect(noteCell).toHaveStyle('background-color: transparent');

    // Click the button
    userEvent.click(noteButton);

    // Verify playNote called
    expect(SoundfontAudio.playNote).toHaveBeenCalledWith('C');

    // UX Improvement check: Verify the cell has the active background color
    expect(noteCell).toHaveStyle('background-color: rgba(59, 130, 246, 0.2)');

    // Allow the async playNote promise to resolve and the finally block to schedule the timer
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Fast-forward time to trigger the cleanup
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Check if style reverted
    expect(noteCell).toHaveStyle('background-color: transparent');
  });
});
