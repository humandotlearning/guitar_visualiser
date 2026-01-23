/* eslint-env jest */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ScaleSelector from './ScaleSelector';
import { SCALE_LIBRARY } from '../utils/musicTheory';

describe('ScaleSelector Component', () => {
  const mockSetRootNote = jest.fn();
  const mockSetSelectedScale = jest.fn();
  const defaultProps = {
    rootNote: 'C',
    setRootNote: mockSetRootNote,
    selectedScale: { category: 'Pentatonic', name: 'Major Pentatonic' },
    setSelectedScale: mockSetSelectedScale,
  };

  test('renders root notes with accessibility attributes', () => {
    render(<ScaleSelector {...defaultProps} />);

    // Check for group role and label
    const rootNoteGroup = screen.getByRole('group', { name: /root note/i });
    expect(rootNoteGroup).toBeInTheDocument();

    // Check for aria-pressed on the selected note
    const selectedNote = screen.getByRole('button', { name: 'C' });
    expect(selectedNote).toHaveAttribute('aria-pressed', 'true');

    // Check for aria-pressed=false on unselected note
    const unselectedNote = screen.getByRole('button', { name: 'D' });
    expect(unselectedNote).toHaveAttribute('aria-pressed', 'false');
  });

  test('renders scale categories as tabs', () => {
    render(<ScaleSelector {...defaultProps} />);

    // Check for tablist
    const tabList = screen.getByRole('tablist', { name: /scale type/i });
    expect(tabList).toBeInTheDocument();

    // Check for tabs
    const categories = Object.keys(SCALE_LIBRARY);
    categories.forEach(category => {
      const tab = screen.getByRole('tab', { name: category });
      expect(tab).toBeInTheDocument();
    });

    // Check active tab
    const tabs = screen.getAllByRole('tab');
    const selectedTabs = tabs.filter(tab => tab.getAttribute('aria-selected') === 'true');
    expect(selectedTabs).toHaveLength(1);
  });

  test('renders scales with aria-pressed', () => {
    render(<ScaleSelector {...defaultProps} />);

    // Let's find the Pentatonic tab
    const pentatonicTab = screen.getByRole('tab', { name: 'Pentatonic' });
    fireEvent.click(pentatonicTab);

    // Now verify the scale buttons
    const selectedScaleBtn = screen.getByRole('button', { name: 'Major Pentatonic' });
    expect(selectedScaleBtn).toHaveAttribute('aria-pressed', 'true');

    const unselectedScaleBtn = screen.getByRole('button', { name: 'Minor Pentatonic' });
    expect(unselectedScaleBtn).toHaveAttribute('aria-pressed', 'false');
  });
});
