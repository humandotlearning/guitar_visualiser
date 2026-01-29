import React from 'react';
import { render, screen } from '@testing-library/react';
import FretboardCustomization from './FretboardCustomization';

describe('FretboardCustomization', () => {
  const defaultProps = {
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    setTuning: jest.fn(),
    fretCount: 24,
    setFretCount: jest.fn(),
  };

  test('renders form inputs by default', () => {
    render(<FretboardCustomization {...defaultProps} />);

    // Check for Tuning label and select
    expect(screen.getByLabelText(/Tuning/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Tuning/i })).toBeInTheDocument();

    // Check for Fret Count label and input
    expect(screen.getByLabelText(/Fret Count/i)).toBeInTheDocument();
    // Input type range doesn't always have a specific role that allows querying by name easily without label association
    // But getByLabelText should work
    expect(screen.getByLabelText(/Fret Count/i)).toHaveAttribute('type', 'range');
  });

  test('renders read-only view when readOnly is true', () => {
    render(<FretboardCustomization {...defaultProps} readOnly={true} />);

    // Should NOT have form inputs
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    // Should display the values as text
    expect(screen.getByText('Standard')).toBeInTheDocument(); // Standard is derived from EADGBE
    expect(screen.getByText('24')).toBeInTheDocument();

    // Should have specific read-only layout text/headers if we decide on them
    // For now, checking the values exist is a good start
  });
});
