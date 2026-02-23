from playwright.sync_api import sync_playwright, expect

def verify_copy_notes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant clipboard permissions
        context = browser.new_context(permissions=['clipboard-read', 'clipboard-write'])
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            # Wait for app to load
            print("Waiting for app to load...")
            page.wait_for_selector("text=Notes of", timeout=60000)

            # Find the copy button using proper accessible name
            print("Finding Copy Notes button...")
            copy_button = page.get_by_role("button", name="Copy scale notes to clipboard")
            expect(copy_button).to_be_visible()

            # Click the button
            print("Clicking Copy Notes button...")
            copy_button.click()

            # Check for Copied! text
            print("Verifying Copied! state...")
            expect(page.get_by_text("Copied!")).to_be_visible()

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification_copy_notes.png")
            print("Screenshot saved to verification_copy_notes.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error_screenshot.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_copy_notes()
