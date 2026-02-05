from playwright.sync_api import sync_playwright, expect
import os

def verify_chord_play_button():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            print("Waiting for Chord Visualizer...")
            chord_table = page.locator(".chord-table")
            chord_table.wait_for(state="visible", timeout=30000)
            chord_table.scroll_into_view_if_needed()

            print("Selecting SECOND chord...")
            second_chord_btn = page.locator(".chord-table td button.chord-button").nth(1)
            second_chord_btn.click()

            page.wait_for_timeout(1000)

            print("Taking screenshot...")
            # Use relative path
            page.screenshot(path="verification/chord_play_button.png")

            print("Verification successful!")

        except Exception as e:
            print(f"Error: {e}")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_chord_play_button()
