import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import AudioPlayback from './AudioPlayback';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';

// Mock the utils directly
jest.mock('../utils/soundfontAudioUtils', () => ({
  initializeAudio: jest.fn().mockResolvedValue({}),
  loadInstrument: jest.fn().mockResolvedValue({
    play: jest.fn(),
    stop: jest.fn(),
  }),
  playNote: jest.fn().mockResolvedValue(),
  playChord: jest.fn().mockResolvedValue(),
  playString: jest.fn().mockResolvedValue(),
  playFrettedNote: jest.fn().mockResolvedValue(),
  setVolume: jest.fn(),
  setSustain: jest.fn(),
}));

describe('AudioPlayback Component', () => {
  const mockProps = {
    rootNote: 'C',
    selectedScale: { category: 'Major Family', name: 'Major' },
    selectedChord: ['C', 'E', 'G'],
    selectedInstrument: 'acoustic_guitar_steel',
    onInstrumentChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Test Sound button', async () => {
    render(<AudioPlayback {...mockProps} />);

    // Open settings panel
    const settingsButton = screen.getByLabelText('Sound Settings');
    fireEvent.click(settingsButton);

    const testButton = screen.getByText('Test Sound');
    expect(testButton).toBeInTheDocument();
  });

  test('Test Sound button triggers audio and shows loading state', async () => {
    // We need to fake timers for setTimeout
    jest.useFakeTimers();

    render(<AudioPlayback {...mockProps} />);

    // Initialize audio first (simulate click)
    const container = screen.getByText(/Audio Playback/i).closest('div');
    fireEvent.click(container); // Triggers initAudio

    // Wait for audio initialization effect
    await waitFor(() => {
        expect(SoundfontAudio.initializeAudio).toHaveBeenCalled();
    });

    // Open settings panel
    const settingsButton = screen.getByLabelText('Sound Settings');
    fireEvent.click(settingsButton);

    const testButton = screen.getByText('Test Sound');

    // Click test button
    fireEvent.click(testButton);

    // Verify playChord was called
    expect(SoundfontAudio.playChord).toHaveBeenCalled();

    // Check for loading state - wait for state update
    // Note: The implementation is not there yet, so this test is expected to fail or not find the loading state
    // But since I am writing the test BEFORE the implementation (TDDish), I should expect it to fail if I ran it now.
    // However, I'm just creating the file.

    // In the future implementation, "Test Sound" text should be replaced or accompanied by "Playing..."
    // For now, let's just checking playChord call is enough for the "before" state,
    // but the plan says "verify that clicking the button triggers the mocked audio function AND changes the button state".

    // Check for loading state
    expect(screen.getByText('Playing...')).toBeInTheDocument();

    // Wait for the async playChord to resolve and register the timeout
    await act(async () => {
        await Promise.resolve();
    });

    // Fast-forward time to finish playback
    act(() => {
        jest.advanceTimersByTime(1500);
    });

    // Check that it returns to normal
    expect(screen.getByText('Test Sound')).toBeInTheDocument();

    // Cleanup
    jest.useRealTimers();
  });

  test('volume and sustain sliders have accessible aria-valuetext', () => {
    render(<AudioPlayback {...mockProps} />);

    // Open settings panel
    const settingsButton = screen.getByLabelText('Sound Settings');
    fireEvent.click(settingsButton);

    const volumeSlider = screen.getByLabelText(/Volume:/);
    const sustainSlider = screen.getByLabelText(/Sustain:/);

    // Initial values
    expect(volumeSlider).toHaveAttribute('aria-valuetext', '80%');
    expect(sustainSlider).toHaveAttribute('aria-valuetext', '1.5 seconds');

    // Change volume
    fireEvent.change(volumeSlider, { target: { value: '0.5' } });
    expect(volumeSlider).toHaveAttribute('aria-valuetext', '50%');

    // Change sustain
    fireEvent.change(sustainSlider, { target: { value: '2.0' } });
    expect(sustainSlider).toHaveAttribute('aria-valuetext', '2.0 seconds');
  });
});
