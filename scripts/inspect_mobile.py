from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('http://localhost:3000', wait_until='networkidle')

    nav = page.locator('nav').nth(1)
    print("Nav outerHTML:")
    print(nav.evaluate("el => el.outerHTML"))

    comp = nav.evaluate("""el => {
        const s = window.getComputedStyle(el);
        return {
            display: s.display,
            position: s.position,
            bottom: s.bottom,
            zIndex: s.zIndex,
            bg: s.backgroundColor,
            box: el.getBoundingClientRect()
        };
    }""")
    print("Computed styles:", comp)

    # Let's take screenshot of the nav specifically
    nav.screenshot(path="screenshots/nav_only.png")
    print("Saved screenshots/nav_only.png")

    browser.close()
