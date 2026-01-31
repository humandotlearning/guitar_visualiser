import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AudioPlayback from './AudioPlayback';

// Mock the soundfontAudioUtils
jest.mock('../utils/soundfontAudioUtils', () => ({
  initializeAudio: jest.fn().mockResolvedValue({}),
  loadInstrument: jest.fn().mockResolvedValue({}),
  setVolume: jest.fn(),
  setSustain: jest.fn(),
  playNote: jest.fn().mockResolvedValue(),
  playChord: jest.fn().mockResolvedValue(),
}));

describe('AudioPlayback Component', () => {
  const defaultProps = {
    rootNote: 'C',
    selectedScale: { category: 'Major Family', name: 'Major' },
    selectedChord: [],
    selectedInstrument: 'acoustic_guitar_steel',
    onInstrumentChange: jest.fn(),
  };

  test('settings toggle has correct ARIA attributes', async () => {
    await act(async () => {
      render(<AudioPlayback {...defaultProps} />);
    });

    const settingsButton = screen.getByLabelText('Sound Settings');

    // Initially closed
    expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
    expect(settingsButton).toHaveAttribute('aria-controls', 'audio-settings-panel');

    // Click to open
    await act(async () => {
      fireEvent.click(settingsButton);
    });

    expect(settingsButton).toHaveAttribute('aria-expanded', 'true');

    // Check panel accessibility
    const panel = screen.getByRole('dialog');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute('aria-modal', 'true');
    expect(panel).toHaveAttribute('aria-labelledby', 'audio-settings-title');
    expect(panel).toHaveAttribute('id', 'audio-settings-panel');

    // Check title id
    const title = screen.getByText('Audio Settings');
    expect(title).toHaveAttribute('id', 'audio-settings-title');
  });
});
