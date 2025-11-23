# CLAUDE.md - AI Assistant Context

This document provides context for AI assistants working on the Multi-Instrument Scale and Chord Visualizer project.

## Project Overview

**Purpose**: An interactive web application that helps musicians visualize and learn scales and chords across multiple instruments (Guitar, Ukulele, Piano).

**Target Users**:
- Musicians learning music theory
- Guitar/ukulele players exploring scales
- Piano players understanding chord structures
- Music students studying intervals and harmony

**Live Demo**: https://humandotlearning.github.io/guitar_visualiser

## Architecture Overview

### Technology Stack
- **React 18**: Modern React with functional components and hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives (Select, Switch, Checkbox, Collapsible)
- **soundfont-player**: High-quality instrument audio playback
- **@tombatossals/react-chords**: Chord diagram visualization
- **@tombatossals/chords-db**: Comprehensive chord data library

### Key Design Decisions

1. **Instrument-Agnostic Architecture**:
   - All instrument data centralized in `src/instruments.js`
   - Components adapt based on `instrumentConfig` prop
   - Easy to add new instruments without modifying component code

2. **Lazy Loading for Performance**:
   - Large components (Fretboard, PianoKeyboard, ChordVisualizer, AudioPlayback) are lazy-loaded
   - Reduces initial bundle size and improves Time to Interactive (TTI)
   - Suspense boundaries with loading fallbacks

3. **Type Polymorphism**:
   - String instruments (`type: undefined`) render Fretboard component
   - Keyboard instruments (`type: 'keyboard'`) render PianoKeyboard component
   - Automatic detection in App.js based on `instrumentConfig.type`

4. **Music Theory Separation**:
   - All music theory logic isolated in `src/utils/musicTheory.js`
   - Reusable functions for scales, intervals, chord generation
   - No music theory calculations in components

## Component Architecture

### Core Components

#### `App.js` (Main Controller)
- **State Management**: Manages global state (rootNote, selectedScale, selectedInstrument, etc.)
- **Instrument Switching**: Handles instrument selection and config derivation
- **Lazy Loading**: Uses React.lazy() and Suspense for performance
- **Component Orchestration**: Passes props to child components

**Key State Variables**:
```javascript
rootNote              // Current root note (A-G)
selectedScale         // { category, name }
selectedInstrument    // Instrument key from INSTRUMENTS config
selectedChord         // Currently selected chord notes
showScaleDegrees      // Toggle for showing scale degrees vs note names
showScaleOnPiano      // Piano-specific: show scale visualization
showChordOnPiano      // Piano-specific: show chord visualization
```

#### `Fretboard.jsx` (String Instrument Visualization)
- Renders interactive fretboard for guitar, ukulele, etc.
- Highlights scale notes across all strings and frets
- Shows fret markers (single dots, double dots)
- Adapts to instrument configuration (strings, tuning, fretCount)
- Supports scale degree display

**Key Props**:
- `instrumentConfig`: Full instrument configuration object
- `rootNote`, `selectedScale`: Current scale selection
- `showScaleDegrees`: Toggle display mode

#### `PianoKeyboard.jsx` (Keyboard Visualization)
- Renders piano keyboard with configurable octave range
- Highlights scale notes and chord notes
- Separate toggles for scale/chord visualization
- Responsive design for different screen sizes
- Handles black/white key rendering

**Key Props**:
- `instrumentConfig`: Contains startOctave, endOctave
- `showScaleVisualization`, `showChordVisualization`: Independent toggles
- `selectedChord`: Chord notes to highlight

#### `ChordVisualizer.jsx` (Chord Display)
- Displays chords that belong to the selected scale
- Uses @tombatossals/react-chords for chord diagrams
- Supports multiple chord variations per position
- Click handling to select chords
- Adapts chord data based on instrument type

**Data Flow**:
1. Receives `rootNote` and `selectedScale`
2. Calculates scale notes using musicTheory.js
3. Loads chord data from chords-db
4. Filters chords that fit the scale
5. Renders chord diagrams with react-chords

#### `AudioPlayback.jsx` (Sound Engine)
- Uses soundfont-player for realistic instrument sounds
- Plays scales (ascending/descending)
- Plays selected chords
- Supports all instruments via soundfont switching
- Loading state management

**Audio Loading Flow**:
1. Component mounts → loads soundfont for selected instrument
2. User changes instrument → unloads old soundfont, loads new one
3. User clicks play → plays notes sequentially or simultaneously

#### `ScaleSelector.jsx` (Scale Selection UI)
- Root note dropdown (C, C#, D, etc.)
- Scale type grouped by category (Pentatonic, Major, Minor, Modes, etc.)
- Uses Radix UI Select for accessibility
- Manages scale selection state

#### `ScaleNotes.jsx` (Scale Information Display)
- Shows notes in the selected scale
- Displays scale formula/intervals
- Uses musicTheory.js to calculate notes
- Clean, card-based UI

#### `FretboardCustomization.jsx` (Instrument Settings)
- Shows current tuning and fret count
- Future: Will allow custom tuning per session
- Currently display-only

### Utility Modules

#### `src/utils/musicTheory.js`
**Core Functions**:
- `getNoteIndex(note)`: Convert note name to semitone index
- `getNoteName(index)`: Convert semitone index to note name
- `getScale(rootNote, scaleType)`: Generate scale notes from root and intervals
- `getChordNotes(rootNote, chordType)`: Generate chord notes
- `transposeNote(note, semitones)`: Transpose a note by interval
- `getInterval(note1, note2)`: Calculate interval between notes

**Music Theory Data**:
- `CHROMATIC_NOTES`: All 12 notes in chromatic scale
- `SCALES`: Comprehensive scale library with intervals
- `CHORD_INTERVALS`: Common chord formulas

#### `src/utils/soundfontAudioUtils.js`
- Wrapper around soundfont-player
- Handles soundfont loading and caching
- Provides `playNote()` and `playChord()` functions
- Manages Web Audio API context

#### `src/utils/audioUtils.js`
- Legacy audio utilities (may be deprecated)
- Consider consolidating with soundfontAudioUtils.js

#### `src/instruments.js`
**Instrument Configuration Schema**:
```javascript
{
  label: string,           // Display name
  strings: number,         // Number of strings (for fretboard instruments)
  tuning: string[],        // Note names, high to low
  octaves: number[],       // Octave for each string
  fretCount: number,       // Number of frets
  soundfontName: string,   // Soundfont identifier
  chordDataKey: string,    // Key for chord database
  fretMarkers: number[],   // Fret positions for single dots
  doubleFretMarkers: number[], // Fret positions for double dots
  type?: 'keyboard',       // Optional: indicates keyboard instrument
  startOctave?: number,    // For keyboards
  endOctave?: number,      // For keyboards
}
```

## Common Development Patterns

### Adding a New Feature

1. **Identify Component Location**:
   - UI component → `src/components/`
   - Reusable UI primitive → `src/components/ui/`
   - Utility function → `src/utils/`

2. **State Management**:
   - Global state → Add to `App.js` state
   - Local component state → Use `useState` in component
   - Derived state → Calculate from props, don't store

3. **Styling**:
   - Use Tailwind utility classes
   - Add custom classes to `App.css` for complex styles
   - Follow existing card-based design pattern

4. **Performance**:
   - Large new components → Use React.lazy()
   - Expensive calculations → Use useMemo()
   - Event handlers → Use useCallback()

### Adding a New Instrument

**String Instrument Example**:
```javascript
// src/instruments.js
mandolin: {
  label: 'Mandolin',
  strings: 4,
  tuning: ['E', 'A', 'D', 'G'],
  octaves: [5, 4, 4, 3],
  fretCount: 20,
  soundfontName: 'acoustic_guitar_nylon', // fallback
  chordDataKey: 'mandolin',
  fretMarkers: [3, 5, 7, 9, 12, 15, 17, 19],
  doubleFretMarkers: [12],
}
```

**Keyboard Instrument Example**:
```javascript
// src/instruments.js
organ: {
  label: 'Organ',
  type: 'keyboard',
  startOctave: 2,
  endOctave: 5,
  soundfontName: 'church_organ',
  chordDataKey: 'piano',
}
```

**No code changes needed** - the app automatically:
- Detects instrument type
- Renders appropriate visualization (Fretboard vs PianoKeyboard)
- Loads correct soundfont
- Updates UI labels and components

### Adding a New Scale

```javascript
// src/utils/musicTheory.js
export const SCALES = {
  // ... existing scales
  'Harmonic Major': [0, 2, 4, 5, 7, 8, 11], // semitone intervals
}
```

Then update ScaleSelector.jsx to include it in the appropriate category.

### Working with Audio

```javascript
import Soundfont from 'soundfont-player';

// Load instrument
const instrument = await Soundfont.instrument(audioContext, 'acoustic_guitar_steel');

// Play single note
instrument.play('A4', audioContext.currentTime, { duration: 1 });

// Play chord
['C4', 'E4', 'G4'].forEach(note => {
  instrument.play(note, audioContext.currentTime, { duration: 2 });
});
```

## Development Workflow

### Local Development
```bash
npm install       # Install dependencies
npm start        # Start dev server (localhost:3000)
npm test         # Run tests
npm run build    # Production build
```

### Code Style
- Use functional components with hooks
- Prefer const over let
- Use meaningful variable names (rootNote, not rn)
- Add comments for complex music theory logic
- Keep components under 300 lines (extract sub-components)

### Git Workflow
- Work on feature branches
- Descriptive commit messages
- Test before committing
- Keep commits focused and atomic

## Testing

### Manual Testing Checklist
- [ ] Switch between all instruments
- [ ] Select different scales and root notes
- [ ] Play scales with audio
- [ ] Click and play chords
- [ ] Test on mobile (portrait/landscape)
- [ ] Verify scale degrees toggle
- [ ] Check responsive design on different screen sizes

### Future: Automated Tests
Consider adding:
- Unit tests for musicTheory.js functions
- Component tests for UI interactions
- Integration tests for audio playback
- E2E tests for critical user flows

## Deployment

### GitHub Pages
```bash
npm run deploy    # Builds and deploys to gh-pages branch
```

### GitHub Actions
- Automatically deploys on push to main branch
- See `.github/workflows/` for CI/CD configuration

## Common Issues & Solutions

### Issue: Audio not playing
**Solution**:
- Check Web Audio API browser support
- Ensure user interaction before playing (browsers block autoplay)
- Verify soundfont loaded successfully

### Issue: Chord data missing for instrument
**Solution**:
- Check `chordDataKey` in instruments.js
- Verify @tombatossals/chords-db has data for that key
- Fallback to 'guitar' chordDataKey for similar instruments

### Issue: Performance lag on mobile
**Solution**:
- Verify lazy loading is working
- Check React DevTools for unnecessary re-renders
- Consider memoization for expensive calculations

### Issue: Fretboard not rendering correctly
**Solution**:
- Verify tuning array length matches strings count
- Check octaves array matches tuning array length
- Ensure fretCount is a valid number

## Future Enhancement Ideas

### High Priority
- [ ] Custom tuning editor (allow users to change tuning per session)
- [ ] Chord progression builder
- [ ] Scale comparison view (show multiple scales simultaneously)
- [ ] Dark mode theme

### Medium Priority
- [ ] Ear training mode (play note, user identifies)
- [ ] Practice mode (metronome, loop scales)
- [ ] Export chord diagrams as images
- [ ] Add more instruments (bass, banjo, mandolin)

### Low Priority
- [ ] User accounts and saved preferences
- [ ] Share scales/chords via URL
- [ ] MIDI input support
- [ ] Backing tracks for practice

## Key Files Reference

| File | Purpose | When to Modify |
|------|---------|----------------|
| `src/App.js` | Main app logic | Adding global state, new top-level components |
| `src/instruments.js` | Instrument data | Adding new instruments |
| `src/utils/musicTheory.js` | Music calculations | Adding scales, modifying theory logic |
| `src/components/Fretboard.jsx` | Fretboard UI | Improving fretboard visualization |
| `src/components/PianoKeyboard.jsx` | Piano UI | Improving keyboard visualization |
| `src/components/ChordVisualizer.jsx` | Chord display | Modifying chord selection/display |
| `src/components/AudioPlayback.jsx` | Sound engine | Changing audio behavior |
| `package.json` | Dependencies | Adding libraries, updating scripts |

## Questions to Ask Before Making Changes

1. **Does this feature need global state?** → Consider if App.js state is necessary or if local state suffices
2. **Will this impact performance?** → Consider lazy loading, memoization
3. **Is this instrument-agnostic?** → Ensure new features work across all instruments
4. **Does this follow existing patterns?** → Check similar components for consistency
5. **Is this accessible?** → Use Radix UI components for form controls
6. **Does this work on mobile?** → Test responsive design

## Debugging Tips

### React DevTools
- Check component hierarchy
- Inspect props and state
- Identify unnecessary re-renders
- Profile component performance

### Audio Debugging
```javascript
// Check if soundfont loaded
console.log('Instrument loaded:', instrument);

// Verify AudioContext
console.log('AudioContext state:', audioContext.state);

// Test note playback
instrument.play('C4').then(() => console.log('Note played'));
```

### Music Theory Debugging
```javascript
// src/utils/musicTheory.js
export function getScale(rootNote, scaleType) {
  const result = /* calculation */;
  console.log('Scale:', rootNote, scaleType, '→', result);
  return result;
}
```

## Resources

### Music Theory
- [Music Theory Intervals](https://www.musictheory.net/lessons/30)
- [Scale Construction](https://www.musictheory.net/lessons/21)
- [Chord Theory](https://www.musictheory.net/lessons/40)

### Libraries Used
- [Soundfont Player Docs](https://github.com/danigb/soundfont-player)
- [React Chords](https://github.com/tombatossals/react-chords)
- [Chords DB](https://github.com/tombatossals/chords-db)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)

### Web Audio API
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Audio API Examples](https://github.com/mdn/webaudio-examples)

---

**Last Updated**: 2025-11-23

**For Questions**: Check the GitHub repository issues or discussions
