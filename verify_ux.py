import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Navigating to app...")
    page.goto("http://localhost:3000")

    # Wait for app to load
    print("Waiting for title...")
    page.wait_for_selector("h1", timeout=60000)

    # Initialize audio by clicking body
    print("Initializing audio...")
    page.click("body")

    # Wait for ScaleNotes component
    print("Waiting for ScaleNotes...")
    page.wait_for_selector("text=Notes of")

    # Find the note 'C' button in the table
    # The default scale is A Minor Pentatonic: A, C, D, E, G
    # Let's find 'C'.
    print("Finding note C...")
    # Target the button inside the table cell.
    # The table structure: tbody -> tr -> td -> button
    # We can search for button with text "C" inside the table.
    note_button = page.locator("table tbody tr td button", has_text="C").first

    if not note_button.is_visible():
        print("Note C button not found or visible")
        # Print page content for debugging
        # print(page.content())
        browser.close()
        return

    print("Clicking note C...")
    # Click the button
    note_button.click()

    # Take screenshot immediately to capture the active state (highlight)
    # The highlight lasts 500ms.
    print("Taking screenshot...")
    page.screenshot(path="verification_ux.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
