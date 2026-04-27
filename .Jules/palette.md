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

## 2026-01-30 - Read-Only vs Disabled States
**Learning:** Rendering disabled form inputs for permanently read-only data confuses users by suggesting potential interactivity. Static text presentations are clearer and more honest about the data's state.
**Action:** When a form component is reused for display-only purposes, add a `readOnly` prop to render a semantic text view instead of disabling all inputs.

## 2026-01-31 - Range Input Accessibility
**Learning:** Native range inputs (`<input type="range">`) display their value visually but screen readers announce only the numeric value. For non-linear or formatted values (like percentages or units), this lacks context.
**Action:** Always add `aria-valuetext` to range inputs when the raw numeric value doesn't fully communicate the meaning (e.g., `aria-valuetext="50%"` or `aria-valuetext="1.5 seconds"`).

## 2026-02-01 - Disclosure vs Toggle Attributes
**Learning:** A toggle button that controls the visibility of another element (like a settings panel) is a Disclosure pattern, not a simple State Toggle. It requires `aria-expanded` and `aria-controls` to communicate the relationship and state to screen readers, whereas `aria-pressed` is for buttons that toggle their own state (like "Mute").
**Action:** When implementing a button that opens/closes a panel, menu, or dialog, always use `aria-expanded={isOpen}` and `aria-controls={targetId}` instead of `aria-pressed`.

## 2026-04-18 - Async Feedback Consistency for Key Presses
**Learning:** Just like full scale playback requires loading states, individual note playback via key clicks needs immediate visual confirmation that the click registered, especially since audio loading or playback may be async. Relying solely on auditory feedback is insufficient and leads to a disconnected experience.
**Action:** When a user triggers an individual sound event (like clicking a note in a scale table), implement a temporary visual active state (e.g., via `setTimeout`) combined with a clear disabled state during automated playback to prevent conflicts and provide tactile confirmation.
## 2026-02-02 - State Toggle vs Layout Disclosure Patterns
**Learning:** In interactive tools, there's a distinction between buttons that toggle visual properties within an existing layout (e.g., highlighting non-scale notes) versus buttons that reveal entirely new layout blocks (e.g., showing a Legend or Hints panel). The former correctly uses `aria-pressed`, but the latter is a disclosure pattern.
**Action:** Always use `aria-expanded` and `aria-controls` for buttons that show/hide informational panels or layout blocks, restricting `aria-pressed` to inline visual or state toggles.
## 2026-02-02 - Grid Selection Focus Visibility
**Learning:** Adding `focus-visible` to grid selection items (like root notes and scale types) drastically improves keyboard navigation without affecting mouse users, making the interface far more accessible.
**Action:** Always add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1` to custom button selections in grids that act as filters or toggles.

## 2026-02-03 - Tooltip Keyboard Accessibility
**Learning:** Tooltips or informative elements triggered solely by mouse hover (`onMouseEnter`/`onMouseLeave`) completely lock out keyboard users. A trigger element needs equivalent keyboard focus events (`onFocus`/`onBlur`) to ensure parity. Furthermore, the tooltip relationship needs to be communicated via `aria-expanded` on the trigger, and `aria-describedby` linking to the tooltip element which should have `role="tooltip"`.
**Action:** Always pair `onMouseEnter`/`onMouseLeave` with `onFocus`/`onBlur` on interactive tooltip triggers, and use `aria-expanded` and `aria-describedby` alongside `role="tooltip"` to explicitly associate the tooltip text with the trigger.
