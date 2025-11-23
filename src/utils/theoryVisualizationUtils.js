// File: utils/theoryVisualizationUtils.js
// Helper utilities for theory visualizations

/**
 * Format a scale degree as a Roman numeral
 * @param {number} degree - Scale degree (0-6)
 * @param {string} scaleCategory - Category of scale (Major Family, Minor Family, etc.)
 * @returns {string} - Roman numeral representation
 */
export const formatRomanNumeral = (degree, scaleCategory) => {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  // Major family chord qualities: Major, minor, minor, Major, Major, minor, diminished
  const majorQualities = ['', 'm', 'm', '', '', 'm', 'dim'];

  // Minor family chord qualities: minor, diminished, Major, minor, minor, Major, Major
  const minorQualities = ['m', 'dim', '', 'm', 'm', '', ''];

  if (degree < 0 || degree >= romanNumerals.length) {
    return '?';
  }

  let numeral = romanNumerals[degree];
  let quality = '';

  if (scaleCategory.includes('Major')) {
    quality = majorQualities[degree];
    // Lowercase for minor chords in major keys
    if (quality === 'm') {
      numeral = numeral.toLowerCase();
      quality = ''; // Remove 'm' since lowercase indicates minor
    }
  } else {
    quality = minorQualities[degree];
    // Lowercase for minor chords
    if (quality === 'm') {
      numeral = numeral.toLowerCase();
      quality = '';
    }
  }

  return numeral + quality;
};

/**
 * Get color class for a harmonic function
 * @param {string} func - Harmonic function (Tonic, Subdominant, Dominant)
 * @returns {object} - Object with color classes
 */
export const getChordFunctionColor = (func) => {
  const colorMap = {
    'Tonic': {
      bg: 'bg-blue-100',
      border: 'border-blue-500',
      text: 'text-blue-700',
      hover: 'hover:bg-blue-200'
    },
    'Subdominant': {
      bg: 'bg-green-100',
      border: 'border-green-500',
      text: 'text-green-700',
      hover: 'hover:bg-green-200'
    },
    'Dominant': {
      bg: 'bg-red-100',
      border: 'border-red-500',
      text: 'text-red-700',
      hover: 'hover:bg-red-200'
    }
  };

  return colorMap[func] || {
    bg: 'bg-gray-100',
    border: 'border-gray-500',
    text: 'text-gray-700',
    hover: 'hover:bg-gray-200'
  };
};

/**
 * Get interval quality description
 * @param {number} semitones - Number of semitones
 * @returns {string} - Quality description (Perfect, Major, Minor, etc.)
 */
export const getIntervalQuality = (semitones) => {
  const qualities = [
    'Perfect',    // 0 - Unison
    'Minor',      // 1 - Minor 2nd
    'Major',      // 2 - Major 2nd
    'Minor',      // 3 - Minor 3rd
    'Major',      // 4 - Major 3rd
    'Perfect',    // 5 - Perfect 4th
    'Augmented',  // 6 - Tritone
    'Perfect',    // 7 - Perfect 5th
    'Minor',      // 8 - Minor 6th
    'Major',      // 9 - Major 6th
    'Minor',      // 10 - Minor 7th
    'Major',      // 11 - Major 7th
  ];

  return qualities[semitones % 12] || 'Unknown';
};

/**
 * Calculate SVG arc path for circle segments
 * @param {number} startAngle - Start angle in degrees
 * @param {number} angleSize - Size of the arc in degrees
 * @param {number} innerRadius - Inner radius
 * @param {number} outerRadius - Outer radius
 * @returns {string} - SVG path string
 */
export const calculateArc = (startAngle, angleSize, innerRadius, outerRadius) => {
  const toRadians = (angle) => (angle * Math.PI) / 180;

  const startRad = toRadians(startAngle);
  const endRad = toRadians(startAngle + angleSize);

  const x1 = 200 + outerRadius * Math.cos(startRad);
  const y1 = 200 + outerRadius * Math.sin(startRad);
  const x2 = 200 + outerRadius * Math.cos(endRad);
  const y2 = 200 + outerRadius * Math.sin(endRad);

  const x3 = 200 + innerRadius * Math.cos(endRad);
  const y3 = 200 + innerRadius * Math.sin(endRad);
  const x4 = 200 + innerRadius * Math.cos(startRad);
  const y4 = 200 + innerRadius * Math.sin(startRad);

  const largeArc = angleSize > 180 ? 1 : 0;

  return [
    `M ${x1} ${y1}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
    'Z'
  ].join(' ');
};

/**
 * Get text position for circle labels
 * @param {number} angle - Angle in degrees
 * @param {number} radius - Radius for text placement
 * @returns {object} - Object with x and y coordinates
 */
export const getTextPosition = (angle, radius) => {
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const rad = toRadians(angle);

  return {
    x: 200 + radius * Math.cos(rad),
    y: 200 + radius * Math.sin(rad)
  };
};

/**
 * Get description for harmonic function
 * @param {string} func - Harmonic function name
 * @returns {string} - Description of the function
 */
export const getFunctionDescription = (func) => {
  const descriptions = {
    'Tonic': 'Stability, home, resolution',
    'Subdominant': 'Movement away from tonic, preparation',
    'Dominant': 'Tension, wants to resolve to tonic'
  };

  return descriptions[func] || '';
};
