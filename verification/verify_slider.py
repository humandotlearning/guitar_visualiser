from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_slider_focus(page: Page):
    # 1. Arrange: Go to the app
    page.goto("http://localhost:3000")

    # Wait for the page to load
    page.wait_for_selector("text=Audio Playback")

    # 2. Act: Open settings
    page.get_by_label("Sound Settings").click()

    # Wait for settings panel
    page.wait_for_selector(".settings-panel")

    # Focus on the volume slider
    slider = page.locator("#volume-control-audio")
    slider.focus()

    # 3. Screenshot
    page.screenshot(path="verification/slider_focus.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_slider_focus(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
