from playwright.sync_api import sync_playwright

def verify_copy_notes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant clipboard permissions
        context = browser.new_context()
        context.grant_permissions(['clipboard-read', 'clipboard-write'])

        page = context.new_page()

        # Navigate to the app (assuming default create-react-app port)
        try:
            page.goto("http://localhost:3000", timeout=60000)
            print("Navigated to app")

            # Wait for ScaleNotes component to load
            # It's inside a card with "Notes of A Minor Pentatonic" by default
            header_selector = "h2:has-text('Notes of A Minor Pentatonic')"
            page.wait_for_selector(header_selector)
            print("Found ScaleNotes header")

            # Find the copy button
            # It should have the aria-label "Copy notes to clipboard" initially
            copy_btn = page.locator("button[aria-label='Copy notes to clipboard']")

            if copy_btn.count() > 0:
                print("Found copy button")

                # Take initial screenshot
                page.screenshot(path="verification-before-click.png")
                print("Took before screenshot")

                # Click the button
                copy_btn.click()
                print("Clicked copy button")

                # Verify aria-label changes to "Copied to clipboard"
                copied_btn = page.locator("button[aria-label='Copied to clipboard']")
                copied_btn.wait_for(state="visible", timeout=2000)
                print("Button state changed to Copied")

                # Take success screenshot
                page.screenshot(path="verification-after-click.png")
                print("Took after screenshot")

                # Verify clipboard content (if possible in headless)
                # Note: Playwright clipboard access might be limited in some environments
                # but we granted permissions
                # clipboard_text = page.evaluate("navigator.clipboard.readText()")
                # print(f"Clipboard content: {clipboard_text}")

            else:
                print("Copy button not found!")
                page.screenshot(path="verification-failed.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification-error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_copy_notes()
