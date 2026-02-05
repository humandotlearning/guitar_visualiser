import { render, screen, act } from '@testing-library/react';
import App from './App';
import * as SoundfontAudio from './utils/soundfontAudioUtils';

// Mock the utils directly to avoid dealing with external library mocks and audio context
jest.mock('./utils/soundfontAudioUtils', () => ({
  ...jest.requireActual('./utils/soundfontAudioUtils'),
  initializeAudio: jest.fn().mockResolvedValue({}),
  loadInstrument: jest.fn().mockResolvedValue({
    play: jest.fn(),
    stop: jest.fn(),
  }),
  playNote: jest.fn().mockResolvedValue(),
  playChord: jest.fn().mockResolvedValue(),
  playString: jest.fn().mockResolvedValue(),
  playFrettedNote: jest.fn().mockResolvedValue(),
}));

test('renders Guitar Visualizer title', async () => {
  await act(async () => {
    render(<App />);
  });

  const titleElements = screen.getAllByText(/Visualizer/i);
  expect(titleElements.length).toBeGreaterThan(0);
});

test('instrument selector has accessible label', async () => {
  await act(async () => {
    render(<App />);
  });

  const select = screen.getByLabelText(/select instrument/i);
  expect(select).toBeInTheDocument();
  expect(select).toHaveAttribute('id', 'instrument-select');
});
