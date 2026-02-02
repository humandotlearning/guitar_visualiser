from playwright.sync_api import Page, expect, sync_playwright

def verify_scale_selector(page: Page):
    # 1. Arrange: Go to the app
    page.goto("http://localhost:3000")

    # Wait for the app to load
    expect(page.get_by_text("Select Instrument")).to_be_visible()

    # 2. Act: Interact with Root Note Selector
    root_note_group = page.get_by_role("group", name="Root Note")
    expect(root_note_group).to_be_visible()

    # Click 'E' inside the root note group
    root_note_group.get_by_role("button", name="E", exact=True).click()

    # Interact with Scale Type Selector
    scale_type_tablist = page.get_by_role("tablist", name="Scale Type")
    expect(scale_type_tablist).to_be_visible()

    # Click 'Major Family'
    page.get_by_role("tab", name="Major Family").click()

    # Click 'Lydian' with exact match
    page.get_by_role("button", name="Lydian", exact=True).click()

    # 3. Assert
    # Check if the notes of E Lydian are displayed
    expect(page.get_by_role("heading", name="Notes of E Lydian")).to_be_visible()

    # 4. Screenshot
    page.screenshot(path="verification/scale_selector_verified.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_scale_selector(page)
            print("Verification successful")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
