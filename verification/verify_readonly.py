from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            print("Waiting for heading...")
            page.wait_for_selector("h2:has-text('Fretboard Customization')", timeout=10000)

            # Scroll to it
            heading = page.get_by_text("Fretboard Customization")
            heading.scroll_into_view_if_needed()

            print("Checking for read-only elements...")

            # Scope to the customization card
            # We assume it's in a div that contains the header
            # But simpler: look for "Tuning" label and its value sibling/neighbor

            # Verify "Standard" is visible
            expect(page.get_by_text("Standard", exact=True)).to_be_visible()

            # Verify "Fret Count" label is visible
            expect(page.get_by_text("Fret Count", exact=True)).to_be_visible()

            # For 24, we need to distinguish it from the fretboard numbers
            # We can use the fact that it is next to "Fret Count"
            # Or just filter by the specific class we added: text-slate-700
            # But classes are brittle.

            # Let's try finding the span with 24
            # We can use the CSS selector for the structure we created:
            # div.space-y-4 > div > span

            count_value = page.locator("span.font-bold").get_by_text("24", exact=True)
            expect(count_value).to_be_visible()

            # Verify inputs are NOT there
            if page.query_selector("select#tuning"):
                print("FAILURE: Found tuning select element!")
            else:
                print("SUCCESS: Tuning select element not found.")

            if page.query_selector("input#fretCount"):
                print("FAILURE: Found fretCount input element!")
            else:
                print("SUCCESS: FretCount input element not found.")

            print("Taking screenshot...")
            page.screenshot(path="verification/fretboard_customization.png")
            print("Screenshot saved to verification/fretboard_customization.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
