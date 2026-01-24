from playwright.sync_api import Page, expect, sync_playwright
import time

def test_audio_settings(page: Page):
    # 1. Navigate
    print("Navigating to localhost:3000...")
    page.goto("http://localhost:3000")

    # Wait for the app to load (checking for title or main element)
    expect(page.get_by_text("Visualizer", exact=False).first).to_be_visible(timeout=30000)

    # 2. Click Sound Settings button
    # The button has aria-label="Sound Settings"
    settings_btn = page.get_by_label("Sound Settings")
    settings_btn.click()

    # 3. Verify Dialog is open
    dialog = page.get_by_role("dialog")
    expect(dialog).to_be_visible()

    # 4. Verify Close Button has focus
    # We can check if the active element has the label "Close settings"
    close_btn = page.get_by_label("Close settings")
    expect(close_btn).to_be_focused()

    # 5. Screenshot
    page.screenshot(path="verification/audio_settings.png")
    print("Screenshot saved to verification/audio_settings.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_audio_settings(page)
        except Exception as e:
            print(f"Error: {e}")
            # Take screenshot on error if possible
            try:
                page.screenshot(path="verification/error_state.png")
            except:
                pass
            raise e
        finally:
            browser.close()
