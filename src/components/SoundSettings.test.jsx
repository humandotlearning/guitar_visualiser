import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SoundSettings from './SoundSettings';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';

// Mock the soundfontAudioUtils
jest.mock('../utils/soundfontAudioUtils', () => ({
  playNote: jest.fn().mockResolvedValue(undefined),
  playChord: jest.fn().mockResolvedValue(undefined),
  initializeAudio: jest.fn().mockResolvedValue(undefined),
  loadInstrument: jest.fn().mockResolvedValue(undefined),
  setVolume: jest.fn(),
  setSustain: jest.fn(),
}));

describe('SoundSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders settings toggle button', () => {
    render(<SoundSettings />);
    const toggleButton = screen.getByLabelText('Sound Settings');
    expect(toggleButton).toBeInTheDocument();
  });

  it('opens panel when toggle is clicked', () => {
    render(<SoundSettings />);
    const toggleButton = screen.getByLabelText('Sound Settings');
    fireEvent.click(toggleButton);
    const panel = screen.getByText('Guitar Sound');
    expect(panel).toBeInTheDocument();
  });

  it('calls playChord when Test Sound button is clicked', async () => {
    render(<SoundSettings />);

    // Open panel
    const toggleButton = screen.getByLabelText('Sound Settings');
    fireEvent.click(toggleButton);

    // Find Test Sound button
    const testButton = screen.getByText('Test Sound');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(SoundfontAudio.playChord).toHaveBeenCalled();
    });
  });

  it('shows loading state while playing', async () => {
    render(<SoundSettings />);

    // Open panel
    const toggleButton = screen.getByLabelText('Sound Settings');
    fireEvent.click(toggleButton);

    // Find Sustain slider and change to minimum (0.5) to speed up test
    const sustainSlider = screen.getByLabelText(/Sustain:/);
    fireEvent.change(sustainSlider, { target: { value: '0.5' } });

    // Find Test Sound button
    const testButton = screen.getByText('Test Sound');
    fireEvent.click(testButton);

    // Should show playing state immediately
    expect(screen.getByText('Playing...')).toBeInTheDocument();
    expect(testButton).toBeDisabled();

    // Should revert to original state after sustain time (0.5s)
    // waitFor default timeout is 1000ms, which is enough
    await waitFor(() => {
      expect(screen.getByText('Test Sound')).toBeInTheDocument();
      expect(testButton).not.toBeDisabled();
    });
  });
});
