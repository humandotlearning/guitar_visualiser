import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000")

        # Wait for app to load
        print("Waiting for title...")
        page.wait_for_selector("text=Guitar Visualizer", timeout=60000)

        # Initialize audio by clicking body just in case
        print("Clicking body...")
        page.click("body")

        # Wait for ScaleNotes component to be visible
        print("Waiting for ScaleNotes...")
        page.wait_for_selector("text=Notes of")

        # Wait for the table to appear
        page.wait_for_selector("table")

        # Find the note 'C' button in the table.
        # The default scale is A Minor Pentatonic: A, C, D, E, G
        # We target the button inside the table cell that contains 'C'.
        # We also need to wait for it to be ENABLED (audio initialized).
        # Selector for enabled button with text 'C' inside table.
        # Use simple css selector combined with text.

        c_button = page.locator("table button", has_text="C")

        print("Waiting for button to be enabled...")
        # Check if disabled
        # We loop/wait until it is enabled.
        for i in range(20):
            if c_button.is_enabled():
                break
            print("Button disabled, waiting...")
            time.sleep(0.5)
            # Try clicking body again if needed?
            page.click("body")

        if not c_button.is_enabled():
            print("Button still disabled. Exiting.")
            # Screenshot for debug
            page.screenshot(path="debug_disabled.png")
            browser.close()
            return

        print("Clicking note C...")
        # Click the button
        c_button.click()

        # Take screenshot immediately to capture the active state (highlight)
        # The highlight lasts 500ms.
        print("Taking screenshot...")
        # Wait a tiny bit for React to render the state change?
        # Usually instantaneous in test environment, but let's just snap.
        time.sleep(0.1)
        page.screenshot(path="verification_ux.png")

        browser.close()

if __name__ == "__main__":
    run()
