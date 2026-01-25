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
