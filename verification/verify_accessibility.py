from playwright.sync_api import sync_playwright, expect

def verify(page):
    print("Navigating to app...")
    page.goto("http://localhost:3000")

    print("Waiting for Fretboard...")
    page.wait_for_selector(".fretboard-container", timeout=10000)

    page.click("body")

    print("Focusing marker...")
    marker = page.locator(".note-marker").first
    marker.focus()

    # Trigger keyboard focus
    page.keyboard.press("Shift+Tab")
    page.keyboard.press("Tab")

    focused_html = page.evaluate("document.activeElement.outerHTML")
    print(f"Focused element: {focused_html}")

    # Screenshot focused element
    try:
        page.locator(":focus").screenshot(path="verification/focused_marker.png")
        print("Screenshot taken of focused marker.")
    except Exception as e:
        print(f"Could not screenshot focused element: {e}")

    print("Focusing string label...")
    label = page.locator(".string-label").first
    label.focus()
    page.keyboard.press("Shift+Tab")
    page.keyboard.press("Tab")

    focused_html = page.evaluate("document.activeElement.outerHTML")
    print(f"Focused label: {focused_html}")

    try:
        page.locator(":focus").screenshot(path="verification/focused_label.png")
        print("Screenshot taken of focused label.")
    except Exception as e:
        print(f"Could not screenshot focused label: {e}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
