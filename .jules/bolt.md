## 2024-05-23 - Fretboard Render Loop Bottleneck
**Learning:** The `Fretboard` component was recalculating scale notes (O(N)) for every single fret (150+ times) inside the render loop, and re-rendering the entire grid on every scroll event due to state updates.
**Action:** Always hoist expensive calculations out of render loops (use `useMemo`), and use `useRef` for high-frequency updates like scrolling or playback status that don't require re-rendering the UI structure.

## 2025-01-24 - FretboardNote Scale Degree Optimization
**Learning:** `FretboardNote` was recalculating scale notes inside `getScaleDegree` for every fret, causing unnecessary allocations. Inlining logic can be risky if domain logic (like music theory) is involved; it's safer to refactor the utility function to accept pre-calculated data.
**Action:** When optimizing tight loops involving utility functions, refactor the utility to accept memoized data instead of duplicating logic.

## 2025-01-24 - Fretboard Grid Memoization
**Learning:** Even if child components are memoized (`React.memo`), the parent component's render loop can still be expensive if it performs O(N) calculations (like `tuning.map` * `fretCount` loop with marker logic) to generate props or wrapper elements.
**Action:** Pre-calculate the grid structure (fret data, marker positions) in `useMemo` so that the render loop only iterates over pre-computed objects, avoiding repeated logic execution during re-renders triggered by unrelated state changes (like showing legends).

## 2025-02-18 - Implicit Data Structures in Visualizers
**Learning:** The `guitar.json` data uses an empty string suffix (`""`) to represent Major chords, but the `ChordVisualizer` mapping logic (`CHORD_TYPE_MAP`) missed this case, causing the "Chord Variations" section to render empty for the default state. This complicated performance verification.
**Action:** When optimizing data-driven components, verify the "zero state" or default data mapping explicitly, as missing keys can be masked by unoptimized re-renders or silent failures.

## 2025-02-19 - ChordVisualizer Derived State
**Learning:** `ChordVisualizer` was using `useEffect` to sync `rootNote`/`selectedScale` props to local `chords` state, causing a double-render cascade (Render 1 -> Effect -> Set State -> Render 2).
**Action:** Replaced `chords` state with `useMemo` derived state. To maintain the behavior of "reset selection on scale change", implemented a "state reset during render" pattern using `prevProps` tracking. This eliminates the intermediate DOM commit and Effect execution.

## 2025-02-21 - O(1) Scale Degree Lookup
**Learning:** `FretboardNote` was performing an O(N) array search via `getScaleDegreeFromNotes` for every fret, despite having the index already computed. Hardcoded array solutions (like `['1', '2'...]`) are brittle and fail for scales > 7 notes.
**Action:** Replace redundant searches with direct index arithmetic (e.g., `(index + 1).toString()`) when the index is already known, ensuring O(1) performance and generalized support for any list length.

## 2025-02-21 - Fretboard Render Loop Memoization
**Learning:** The `Fretboard` component's render loop (mapping over 150+ frets/strings) was re-executing whenever any state changed (like toggling legends), even if the grid data was memoized. `React.memo` on child components is not enough if the parent re-creates the VDOM structure around them.
**Action:** Extract expensive render loops (like grids or lists) into a dedicated, memoized sub-component (e.g., `FretboardGrid`) to prevent VDOM re-creation when parent state changes.

## 2025-02-25 - PianoKeyboard Prop Stability
**Learning:** `PianoKeyboard` was re-rendering on every `App` state change (like `theoryMode`) because `App.js` was passing unstable inline callbacks (`() => setShow...`) for toggle controls. Even with `React.memo`, these new function references forced re-renders.
**Action:** Use `useCallback` for event handlers passed to heavy, memoized components. Ensure the dependency array is correct (empty if using functional state updates) to keep the callback stable across renders.
