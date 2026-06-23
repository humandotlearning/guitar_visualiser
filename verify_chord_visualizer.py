from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:3000")

    # Wait for the app to load
    page.wait_for_selector("text=Select Instrument")

    # Wait for Chord Visualizer (it is lazy loaded)
    # Scroll to the bottom
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

    # Find the header
    header = page.locator("h2", has_text="Chords in the Scale of")
    try:
        header.wait_for(timeout=10000)
    except:
        print("Chord Visualizer header not found. Maybe lazy loading took too long or scale not selected.")
        page.screenshot(path="verification_failed.png")
        return

    # Find the chord table
    table = page.locator(".chord-table")
    table.wait_for()

    # Take initial screenshot
    page.screenshot(path="verification_initial.png")

    # Find all buttons with class 'chord-button'
    chord_buttons = page.locator(".chord-button").all()

    if not chord_buttons:
        print("No chord buttons found.")
        return

    print(f"Found {len(chord_buttons)} chord buttons.")

    # The first one should be selected by default
    first_btn = chord_buttons[0]
    is_first_selected = first_btn.get_attribute("aria-pressed") == "true"
    print(f"First button selected? {is_first_selected}")

    # Check Play button for first chord
    # Find the Play button in the same td (siblings of chord-button)
    # We can use locator relative to the button
    # Or navigate up to td then down to button
    # Using xpath relative to button: ../button[contains(@class, 'play-button')]
    # Or simpler:
    # Get the parent td
    first_td = first_btn.locator("..")
    first_play_btn = first_td.locator("button.play-button")

    # Check if visible
    # Playwright's is_visible checks for display:none, visibility:hidden, etc.
    # BUT we used Tailwind 'invisible' which is visibility:hidden.
    # So is_visible() should return False if invisible.

    print(f"First Play button visible? {first_play_btn.is_visible()}")

    # Screenshot of first state
    page.screenshot(path="verification_state1.png")

    if len(chord_buttons) > 1:
        second_btn = chord_buttons[1]
        print(f"Clicking second chord: {second_btn.inner_text()}")
        second_btn.click()

        # Wait for selection update? React updates fast.
        page.wait_for_timeout(500)

        # Check aria-pressed
        is_second_selected = second_btn.get_attribute("aria-pressed") == "true"
        print(f"Second button selected? {is_second_selected}")

        # Check Play buttons visibility
        second_td = second_btn.locator("..")
        second_play_btn = second_td.locator("button.play-button")
        print(f"Second Play button visible? {second_play_btn.is_visible()}")

        # First one should be invisible now
        first_play_btn_check = first_td.locator("button.play-button")
        print(f"First Play button visible now? {first_play_btn_check.is_visible()}")

        # Take screenshot
        page.screenshot(path="verification_state2.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
