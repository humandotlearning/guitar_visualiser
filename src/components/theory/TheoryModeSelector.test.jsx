import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TheoryModeSelector from './TheoryModeSelector';

describe('TheoryModeSelector', () => {
  const mockSetSelectedMode = jest.fn();
  const defaultProps = {
    selectedMode: 'Scales & Chords',
    setSelectedMode: mockSetSelectedMode,
    instrumentConfig: { type: 'guitar' }
  };

  test('renders all theory modes for guitar', () => {
    render(<TheoryModeSelector {...defaultProps} />);

    expect(screen.getByText('Scales & Chords')).toBeInTheDocument();
    expect(screen.getByText('Circle of Fifths')).toBeInTheDocument();
    expect(screen.getByText('CAGED System')).toBeInTheDocument();
  });

  test('hides CAGED System for keyboard', () => {
    render(<TheoryModeSelector {...defaultProps} instrumentConfig={{ type: 'keyboard' }} />);

    expect(screen.queryByText('CAGED System')).not.toBeInTheDocument();
  });

  test('handles mode selection', () => {
    render(<TheoryModeSelector {...defaultProps} />);

    fireEvent.click(screen.getByText('Circle of Fifths'));
    expect(mockSetSelectedMode).toHaveBeenCalledWith('Circle of Fifths');
  });

  test('has correct accessibility attributes', () => {
    render(<TheoryModeSelector {...defaultProps} />);

    const container = screen.getByRole('group', { name: /theory mode selection/i });
    expect(container).toBeInTheDocument();

    const selectedButton = screen.getByRole('button', { name: /scales & chords/i });
    expect(selectedButton).toHaveAttribute('aria-pressed', 'true');

    const unselectedButton = screen.getByRole('button', { name: /circle of fifths/i });
    expect(unselectedButton).toHaveAttribute('aria-pressed', 'false');
  });
});
