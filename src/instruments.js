const INSTRUMENTS = {
  acoustic_guitar_steel: {
    label: 'Guitar',
    strings: 6,
    tuning: ['E', 'B', 'G', 'D', 'A', 'E'], // standard tuning, high to low (1st to 6th string)
    octaves: [4, 3, 3, 3, 2, 2],
    fretCount: 24,
    soundfontName: 'acoustic_guitar_steel',
    chordDataKey: 'guitar',
    fretMarkers: [3, 5, 7, 9, 12, 15, 17, 19, 21, 24],
    doubleFretMarkers: [12, 24],
  },
  ukulele: {
    label: 'Ukulele',
    strings: 4,
    tuning: ['A', 'E', 'C', 'G'], // standard GCEA, high to low (1st to 4th string)
    octaves: [4, 4, 4, 4],
    fretCount: 15,
    soundfontName: 'acoustic_guitar_nylon', // Fallback to nylon guitar as ukulele might not be available in all soundfonts
    chordDataKey: 'ukulele',
    fretMarkers: [5, 7, 10, 12, 15],
    doubleFretMarkers: [12],
  },
  // Add more instruments here
};

export default INSTRUMENTS;
