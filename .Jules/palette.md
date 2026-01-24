## 2026-01-23 - Interactive Grid Accessibility
**Learning:** Grids of buttons (like note selectors) that act as "radios" but allow only one selection are often best implemented as a `group` with `aria-pressed` or `aria-current` on buttons, rather than a full `radiogroup`, if arrow key navigation isn't implemented. Screen readers announce "pressed" clearly.
**Action:** When converting visual "choice grids" to accessible components, check if `role="radiogroup"` is feasible (needs arrow nav). If not, use `role="group"` with `aria-pressed` for a robust fallback that is still far better than nothing.

## 2026-01-24 - Semantic Interactive Elements
**Learning:** Custom interactive elements (like piano keys) implemented as `div`s lack native keyboard accessibility. Converting them to `<button>`s provides immediate keyboard support (Tab, Enter/Space) but requires careful CSS resetting (`appearance: none`, etc.) to preserve the custom design.
**Action:** When making custom interactive components accessible, start by swapping the tag to `<button>` and resetting styles, rather than adding `tabIndex` and key handlers to a `div`.
