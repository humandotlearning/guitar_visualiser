## 2024-05-23 - Fretboard Render Loop Bottleneck
**Learning:** The `Fretboard` component was recalculating scale notes (O(N)) for every single fret (150+ times) inside the render loop, and re-rendering the entire grid on every scroll event due to state updates.
**Action:** Always hoist expensive calculations out of render loops (use `useMemo`), and use `useRef` for high-frequency updates like scrolling or playback status that don't require re-rendering the UI structure.
