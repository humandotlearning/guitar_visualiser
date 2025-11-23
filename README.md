# 🎸 Multi-Instrument Scale and Chord Visualizer

An interactive web application for musicians to visualize scales, chords, and explore music theory concepts across multiple instruments including guitar, ukulele, and piano.

## 🎸 Live Demo

**[Try the Multi-Instrument Visualizer](https://humandotlearning.github.io/guitar_visualiser)**

![Guitar Scale and Chord Visualizer](public/guitar-visualizer-screenshot.png)

## ✨ Features

### Core Features
- **Multi-Instrument Support**: Seamlessly switch between Guitar, Ukulele, and Piano with instrument-specific visualizations
- **Interactive Scale Selection**: Choose from a comprehensive library of scale types (Pentatonic, Major, Minor, Modes, and more)
- **Smart Visualization**:
  - Fretboard visualization for string instruments (Guitar, Ukulele)
  - Piano keyboard visualization for keyboard instruments
- **Chord Discovery**: View and explore chords that belong to your selected scale with proper chord diagrams
- **High-Quality Audio Playback**: Listen to scales and chords with professional soundfont-based audio
- **Scale Notes & Theory**: View the notes and intervals that make up your selected scale
- **Scale Degrees Display**: Toggle between note names and scale degrees for music theory learning

### Technical Features
- **Lazy Loading**: Optimized performance with code-splitting for faster initial load
- **Responsive Design**: Fully functional on desktop, tablet, and mobile devices
- **Orientation Detection**: Smart prompts for optimal mobile viewing experience
- **Customizable Fretboard**: Adjust tuning and number of frets (where supported)
- **Professional UI**: Built with Radix UI components for accessibility and polish

## 🚀 Technologies Used

- **Frontend Framework**: React 18 with Hooks
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI (Select, Switch, Checkbox, Collapsible)
- **Audio Engine**: soundfont-player for realistic instrument sounds
- **Music Visualization**: @tombatossals/react-chords for chord diagrams
- **Music Theory**: @tombatossals/chords-db for comprehensive chord data
- **Build Tools**: React Scripts (Create React App)
- **Performance**: React.lazy() and Suspense for code-splitting

## 🎹 Multi-Instrument Architecture

The app supports multiple instrument types through a flexible configuration system:

### Supported Instruments
- **Guitar**: 6-string with standard tuning, 24 frets
- **Ukulele**: 4-string with GCEA tuning, 15 frets
- **Piano**: 5-octave keyboard (C2-C6)

### Adding a New String Instrument

1. Open `src/instruments.js`
2. Add a new entry to the `INSTRUMENTS` object:
   ```js
   bass: {
     label: 'Bass Guitar',
     strings: 4,
     tuning: ['G', 'D', 'A', 'E'], // high to low
     octaves: [3, 2, 2, 1],
     fretCount: 20,
     soundfontName: 'electric_bass_finger',
     chordDataKey: 'bass',
     fretMarkers: [3, 5, 7, 9, 12, 15, 17, 19],
     doubleFretMarkers: [12],
   }
   ```
3. The instrument will automatically appear in the selector with full visualization and audio support

### Adding a New Keyboard Instrument

For keyboard instruments, use the `type: 'keyboard'` configuration:
```js
organ: {
  label: 'Organ',
  type: 'keyboard',
  startOctave: 2,
  endOctave: 6,
  soundfontName: 'church_organ',
  chordDataKey: 'piano',
}
```

No additional code changes required—the app automatically detects the instrument type and renders the appropriate visualization!

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/humandotlearning/guitar_visualiser.git
   cd guitar_visualiser
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 📝 Usage Guide

### Getting Started
1. **Select an Instrument**: Use the instrument dropdown at the top to choose Guitar, Ukulele, or Piano
   - The entire interface adapts to your selected instrument
   - String instruments show fretboard visualization
   - Keyboard instruments show piano keyboard visualization

2. **Choose Your Scale**:
   - Pick a root note (A, B, C, etc.)
   - Select a scale type from categories like Pentatonic, Major, Minor, Modes, etc.
   - View the scale notes and intervals in the dedicated panel

3. **Visualize on Your Instrument**:
   - **For Fretboard**: Notes are highlighted across all strings
   - **For Piano**: Keys are highlighted across the keyboard
   - Toggle scale degrees to see intervals (1, 2, 3, etc.) instead of note names

4. **Explore Chords**:
   - Browse chords that fit within your selected scale
   - Click any chord to see its diagram and hear how it sounds
   - Chord visualization adapts to your selected instrument

5. **Audio Playback**:
   - Play the entire scale ascending/descending
   - Play individual chords with realistic instrument sounds
   - Switch instruments to hear the same scale/chord on different instruments

6. **Customize** (String Instruments):
   - View fretboard customization options
   - See instrument-specific tuning and fret count
   - (Future: adjust tuning and fret count per session)

### Pro Tips
- 📱 On mobile, rotate to landscape for the best fretboard viewing experience
- 🎵 Use scale degrees to better understand music theory and intervals
- 🎸 Compare the same scale across different instruments to understand their ranges
- 🎹 Piano visualization helps visualize music theory concepts clearly

## 🔧 Building for Production

To build the app for production:

```
npm run build
```

This creates an optimized production build in the `build` folder.

## 📤 Deployment

The project is configured for GitHub Pages deployment:

```
npm run deploy
```

This command builds the application and deploys it to GitHub Pages.

## 🔄 Continuous Deployment

The project uses GitHub Actions for automatic deployment to GitHub Pages when changes are pushed to the main branch.

## 📱 Compatibility

### Desktop Browsers
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Mobile Browsers
- ✅ Chrome Mobile
- ✅ Safari iOS
- ✅ Firefox Mobile
- ⚠️ Best experience in landscape orientation for fretboard view

### Requirements
- Modern browser with ES6+ support
- JavaScript enabled
- Web Audio API support (for audio playback)

## 🗂️ Project Structure

```
guitar_visualiser/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── AudioPlayback.jsx       # Audio playback controls
│   │   ├── ChordVisualizer.jsx     # Chord display and selection
│   │   ├── Fretboard.jsx           # String instrument visualization
│   │   ├── PianoKeyboard.jsx       # Piano keyboard visualization
│   │   ├── ScaleSelector.jsx       # Scale and root note selection
│   │   ├── ScaleNotes.jsx          # Scale notes display
│   │   ├── FretboardCustomization.jsx
│   │   └── ui/                     # Reusable UI components
│   ├── utils/             # Utility functions
│   │   ├── musicTheory.js         # Music theory calculations
│   │   ├── audioUtils.js          # Audio playback utilities
│   │   └── soundfontAudioUtils.js # Soundfont player integration
│   ├── db/               # Instrument data (JSON)
│   ├── instruments.js    # Instrument configuration
│   └── App.js           # Main application component
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ideas for Contributions
- Add new instruments (mandolin, banjo, bass, etc.)
- Add more scale types and modes
- Improve mobile UX
- Add interval ear training features
- Implement custom tuning editor
- Add chord progression suggestions
- Improve accessibility features
- Add dark mode theme

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate comments.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ for guitarists and music theory enthusiasts
