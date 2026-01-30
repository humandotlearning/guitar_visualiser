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

## 2026-01-27 - Async Feedback Consistency
**Learning:** Even "Test" actions need explicit loading states. Users might assume a "Test Sound" button is instant, but audio context initialization and soundfont loading are async. Without "Playing..." feedback, users may spam-click, causing audio artifacts or frustration.
**Action:** Treat "Test" or "Preview" buttons as async operations requiring immediate visual feedback (spinner/text change) and disabled states, just like form submissions.

## 2026-01-28 - Accessible Interactive Wrappers
**Learning:** Wrapped interactive components (like chord diagrams) often use `div` with `onClick`, which fails accessibility checks. Wrapping them in a `<button>` with style resets (`appearance: none`, `bg: transparent`, etc.) and a proper `aria-label` provides instant keyboard accessibility without visual disruption.
**Action:** When component libraries provide non-interactive visuals that you make interactive, wrap them in a semantic `<button>` instead of a `div`.

## 2026-01-29 - Visual Feedback for Instrument Keys
**Learning:** For musical instrument interfaces (like piano keys), purely auditory feedback is insufficient, especially when audio is async or muted. Users need immediate tactile/visual confirmation (like a key press animation) even for brief clicks. Using `:active` is not enough as it disappears on release; a short `setTimeout` driven state ensures the interaction is registered visually.
**Action:** When implementing instrument keys or sound triggers, always couple the sound trigger with a visual state (playing/active) that persists for a minimum duration (e.g., 300ms) to ensure the user perceives the actuation.

## 2026-01-30 - Focus Visibility for Custom Controls
**Learning:** CSS Resets like `outline: none` on custom controls (like sliders or custom buttons) destroy accessibility unless explicit `:focus-visible` styles are added back. Browsers often hide default rings for mouse users but need them for keyboard users.
**Action:** Whenever using `outline: none` or `appearance: none`, immediately add a `:focus-visible` rule with a clear outline (e.g., `outline: 2px solid var(--primary-color)`) to restore keyboard accessibility.
