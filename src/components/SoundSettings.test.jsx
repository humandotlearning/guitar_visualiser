import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SoundSettings from './SoundSettings';

// Mock the soundfontAudioUtils functions to avoid actual audio playback during testing
jest.mock('../utils/soundfontAudioUtils', () => ({
  loadInstrument: jest.fn().mockResolvedValue(),
  playChord: jest.fn().mockResolvedValue(),
  setVolume: jest.fn(),
  setSustain: jest.fn(),
}));

describe('SoundSettings component', () => {
  it('renders correctly and toggles the settings panel', async () => {
    render(<SoundSettings onInstrumentChange={() => {}} />);

    // Initial state: panel is closed
    const toggleButton = screen.getByRole('button', { name: /Sound Settings/i });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveAttribute('aria-controls', 'sound-settings-panel');

    expect(screen.queryByLabelText(/Guitar Sound/i)).not.toBeInTheDocument();

    // Click to open panel
    fireEvent.click(toggleButton);

    // After clicking: panel is open
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText(/Guitar Sound/i)).toBeInTheDocument();

    // Check panel has the correct ID matching aria-controls
    const panel = screen.getByLabelText(/Guitar Sound/i).closest('.settings-panel');
    expect(panel).toHaveAttribute('id', 'sound-settings-panel');

    // Click to close panel
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => {
        expect(screen.queryByLabelText(/Guitar Sound/i)).not.toBeInTheDocument();
    });
  });
});
