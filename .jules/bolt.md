## 2024-05-23 - Fretboard Render Loop Bottleneck
**Learning:** The `Fretboard` component was recalculating scale notes (O(N)) for every single fret (150+ times) inside the render loop, and re-rendering the entire grid on every scroll event due to state updates.
**Action:** Always hoist expensive calculations out of render loops (use `useMemo`), and use `useRef` for high-frequency updates like scrolling or playback status that don't require re-rendering the UI structure.

## 2025-01-24 - FretboardNote Scale Degree Optimization
**Learning:** `FretboardNote` was recalculating scale notes inside `getScaleDegree` for every fret, causing unnecessary allocations. Inlining logic can be risky if domain logic (like music theory) is involved; it's safer to refactor the utility function to accept pre-calculated data.
**Action:** When optimizing tight loops involving utility functions, refactor the utility to accept memoized data instead of duplicating logic.
