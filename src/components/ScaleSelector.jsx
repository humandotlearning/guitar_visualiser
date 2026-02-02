import React from 'react';
import PropTypes from 'prop-types';
import RootNoteSelector from './RootNoteSelector';
import ScaleTypeSelector from './ScaleTypeSelector';

const ScaleSelector = ({ rootNote, setRootNote, selectedScale, setSelectedScale }) => {
  return (
    <div className="space-y-6">
      {/* Root Note Selector */}
      <RootNoteSelector
        rootNote={rootNote}
        setRootNote={setRootNote}
      />

      {/* Scale Type Selector */}
      <ScaleTypeSelector
        selectedScale={selectedScale}
        setSelectedScale={setSelectedScale}
      />
    </div>
  );
};

ScaleSelector.propTypes = {
  rootNote: PropTypes.string.isRequired,
  setRootNote: PropTypes.func.isRequired,
  selectedScale: PropTypes.shape({
    category: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  setSelectedScale: PropTypes.func.isRequired,
};

export default ScaleSelector;
