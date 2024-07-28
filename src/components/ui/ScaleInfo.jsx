import React from 'react';

const ScaleInfo = ({ scale }) => {
  if (!scale) return null;

  const { name, intervals } = scale;

  return (
    <div className="p-4 bg-gray-100 rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-2">{name}</h2>
      <p>Intervals: {intervals.join(', ')}</p>
    </div>
  );
};

export default ScaleInfo;
