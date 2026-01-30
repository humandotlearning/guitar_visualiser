from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to app
        try:
            page.goto("http://localhost:3000", timeout=60000)

            # Wait for title
            expect(page).to_have_title("Guitar Scale and Chord Visualizer")

            # Select Piano Instrument
            # The select has id "instrument-select"
            page.select_option("#instrument-select", "piano")

            # Wait for Piano Keyboard to appear
            # PianoKeyboard has class "piano-wrapper" or "piano-keys"
            # It is lazy loaded, so we might need to wait.
            page.wait_for_selector(".piano-keys", timeout=10000)

            # Check for keys
            # Keys have class "piano-key"
            keys = page.locator(".piano-key")
            count = keys.count()
            print(f"Found {count} piano keys")

            if count == 0:
                raise Exception("No piano keys found!")

            # Take screenshot
            page.screenshot(path="piano_verification.png")
            print("Screenshot taken: piano_verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error_screenshot.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
