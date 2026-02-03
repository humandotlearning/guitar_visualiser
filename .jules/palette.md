## 2024-05-23 - Audio Settings Modal Accessibility
**Learning:** Modals require careful focus management (trap focus, restore on close) and keyboard support (Escape key) to be truly accessible. Simply adding `role="dialog"` is not enough.
**Action:** When implementing custom modals, always implement a `useEffect` hook to handle the Escape key and manage `document.activeElement` for focus restoration.
