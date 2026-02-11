from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant clipboard permissions
        context = browser.new_context(permissions=['clipboard-read', 'clipboard-write'])
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            # Wait for main header
            page.wait_for_selector("h1", timeout=60000)
            print("App loaded.")

            # Find the Copy Notes button
            # Initially it says "Copy Notes"
            copy_button = page.get_by_role("button", name="Copy Notes")
            copy_button.scroll_into_view_if_needed()
            print("Copy Notes button found.")

            # Take screenshot before click
            page.screenshot(path="verification_before.png")

            # Click the button
            copy_button.click()
            print("Clicked Copy Notes.")

            # Wait for "Copied!" text
            # The button text changes to "Copied!"
            copied_text = page.get_by_text("Copied!")
            copied_text.wait_for(state="visible", timeout=5000)
            print("Button text changed to Copied!")

            # Take screenshot after click
            page.screenshot(path="verification_after.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
