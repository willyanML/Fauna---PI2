from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3000', wait_until='networkidle')
    imgs = page.evaluate('''() => Array.from(document.querySelectorAll('img')).map((img, i) => ({
        index: i,
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        loading: img.loading,
        offsetParent: img.offsetParent !== null,
        classes: img.className
    }))''')
    for img in imgs:
        if not (img['complete'] and img['naturalWidth'] > 0):
            print('FAILED IMG:', img)
        else:
            print('OK #{}: {}'.format(img['index'], img['src']))
    browser.close()
