from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:3000/admin', wait_until='networkidle')
    page.locator("button:has-text('Nova Espécie')").first.click()
    page.wait_for_timeout(500)

    info = page.evaluate("""() => {
        const modal = document.querySelector('.fixed.inset-0.z-\\\\[100\\\\]');
        if (!modal) return null;
        const s = window.getComputedStyle(modal);
        return {
            tagName: modal.tagName,
            className: modal.className,
            position: s.position,
            top: s.top,
            left: s.left,
            right: s.right,
            bottom: s.bottom,
            margin: s.margin,
            padding: s.padding,
            rect: modal.getBoundingClientRect(),
            scrollY: window.scrollY
        };
    }""")
    print("Modal Info:", info)
    browser.close()
