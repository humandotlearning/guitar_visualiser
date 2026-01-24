import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AudioPlayback from './AudioPlayback';

// Mock soundfontAudioUtils
jest.mock('../utils/soundfontAudioUtils', () => ({
  initializeAudio: jest.fn().mockResolvedValue({}),
  loadInstrument: jest.fn().mockResolvedValue({}),
  setVolume: jest.fn(),
  setSustain: jest.fn(),
  playNote: jest.fn().mockResolvedValue(),
  playChord: jest.fn().mockResolvedValue(),
}));

describe('AudioPlayback Accessibility', () => {
  const defaultProps = {
    rootNote: 'C',
    selectedScale: { category: 'Major Family', name: 'Major' },
    selectedChord: ['C', 'E', 'G'],
    selectedInstrument: 'acoustic_guitar_steel',
    onInstrumentChange: jest.fn(),
  };

  test('settings panel has correct accessibility attributes when opened', async () => {
    await act(async () => {
      render(<AudioPlayback {...defaultProps} />);
    });

    // Find and click the settings toggle button
    const settingsButton = screen.getByLabelText('Sound Settings');
    fireEvent.click(settingsButton);

    // Check for dialog role
    // This will fail initially because the role is not yet applied
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'audio-settings-title');

    // Check for title id
    const title = screen.getByText('Audio Settings');
    expect(title).toHaveAttribute('id', 'audio-settings-title');

    // Check for close button accessibility
    const closeButton = screen.getByLabelText('Close settings');
    expect(closeButton).toBeInTheDocument();

    // Check focus management
    expect(closeButton).toHaveFocus();
  });
});
