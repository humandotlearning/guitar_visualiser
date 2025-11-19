# Guitar Scale and Chord Visualizer

An interactive web application for guitarists to visualize scales, chords, and explore music theory concepts on a customizable fretboard.

## 🎸 Live Demo

**[Try the Guitar Scale and Chord Visualizer](https://humandotlearning.github.io/guitar_visualiser)**

![Guitar Scale and Chord Visualizer](public/guitar-visualizer-screenshot.png)

## ✨ Features

- **Instrument Selector**: Choose between guitar, ukulele, and more at the top of the app. The entire UI updates to match your selected instrument.
- **Interactive Scale Selection**: Choose from a variety of scale types (Pentatonic, Major, Minor, etc.)
- **Customizable Fretboard**: Adjust tuning and number of frets (per instrument, where supported)
- **Scale Visualization**: See scale patterns highlighted on the fretboard
- **Chord Discovery**: View chords that belong to your selected scale
- **Audio Playback**: Listen to scales and chords with built-in audio playback
- **Scale Notes Display**: View the notes that make up your selected scale
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Technologies Used

- React
- Tailwind CSS
- JavaScript (ES6+)
- HTML5 Audio API
- React Chords library

## 🎹 Multi-Instrument Support

The app now supports multiple stringed instruments (e.g., guitar, ukulele) and is designed for easy extensibility. All instrument-specific data is managed in a single configuration file.

### Adding a New Instrument

1. Open `src/instruments.js`.
2. Add a new entry to the `INSTRUMENTS` object, e.g.:
   ```js
   bass: {
     label: 'Bass',
     strings: 4,
     tuning: ['G', 'D', 'A', 'E'],
     fretCount: 20,
     // Add more instrument-specific config as needed
   }
   ```
3. Save and restart the app. Your new instrument will appear in the selector and update all relevant UI and logic automatically.

No additional code changes are required for basic support—just update the config!

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

1. **Select an Instrument**: Use the instrument selector at the top of the page to choose your instrument (e.g., Guitar, Ukulele). The app will update all visualizations and controls to match your selection.
2. **Select a Root Note and Scale Type**: Use the dropdown menus to choose your desired scale.
3. **Customize the Fretboard**: Adjust the tuning and number of frets to match your instrument (where supported).
4. **Explore the Scale Pattern**: The notes of the selected scale will be highlighted on the fretboard.
5. **Discover Chords**: View and select chords that fit within your chosen scale.
6. **Listen to Audio**: Play the scale or selected chord to hear how it sounds.

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

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ for guitarists and music theory enthusiasts
