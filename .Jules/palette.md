## 2026-01-23 - Interactive Grid Accessibility
**Learning:** Grids of buttons (like note selectors) that act as "radios" but allow only one selection are often best implemented as a `group` with `aria-pressed` or `aria-current` on buttons, rather than a full `radiogroup`, if arrow key navigation isn't implemented. Screen readers announce "pressed" clearly.
**Action:** When converting visual "choice grids" to accessible components, check if `role="radiogroup"` is feasible (needs arrow nav). If not, use `role="group"` with `aria-pressed` for a robust fallback that is still far better than nothing.

## 2026-01-24 - Semantic Interactive Elements
**Learning:** Custom interactive elements (like piano keys) implemented as `div`s lack native keyboard accessibility. Converting them to `<button>`s provides immediate keyboard support (Tab, Enter/Space) but requires careful CSS resetting (`appearance: none`, etc.) to preserve the custom design.
**Action:** When making custom interactive components accessible, start by swapping the tag to `<button>` and resetting styles, rather than adding `tabIndex` and key handlers to a `div`.

## 2026-01-25 - Global Button Styles vs Custom Interactive Elements
**Learning:** This project has global button styles in `App.css` that enforce background colors and padding. When converting custom interactive elements (like fretboard notes) from `div` to `button` for accessibility, these global styles bleed in.
**Action:** Always verify custom buttons against global styles. Add specific CSS resets (background: transparent, border: none, padding: 0) to your component's CSS when converting to semantic buttons to avoid visual regressions.

## 2026-01-26 - Async Audio Feedback
**Learning:** Audio playback operations (loading soundfonts, scheduling notes) can have invisible latency. Users need immediate visual feedback (like a spinner or "Playing..." text) to confirm their action was registered, especially when the audio context is initializing.
**Action:** Always add a visual "playing" or "loading" state to buttons that trigger audio generation, toggled immediately on click.
