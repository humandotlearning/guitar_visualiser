## 2026-01-23 - Interactive Grid Accessibility
**Learning:** Grids of buttons (like note selectors) that act as "radios" but allow only one selection are often best implemented as a `group` with `aria-pressed` or `aria-current` on buttons, rather than a full `radiogroup`, if arrow key navigation isn't implemented. Screen readers announce "pressed" clearly.
**Action:** When converting visual "choice grids" to accessible components, check if `role="radiogroup"` is feasible (needs arrow nav). If not, use `role="group"` with `aria-pressed` for a robust fallback that is still far better than nothing.

## 2026-01-24 - Custom Settings Panels
**Learning:** Custom "settings" popovers in this app (like in `AudioPlayback`) are implemented as absolute `div`s without dialog semantics, making them inaccessible.
**Action:** When encountering custom popovers, always add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and implement focus management (focus close button on open).
