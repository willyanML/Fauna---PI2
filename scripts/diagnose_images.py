import time
from playwright.sync_api import sync_playwright

def diagnose():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create fresh context with empty cache
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        console_logs = []
        network_failed = []
        network_all = []

        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("requestfailed", lambda req: network_failed.append(f"FAILED: {req.url} - {req.failure}"))
        page.on("response", lambda res: network_all.append(f"{res.status} {res.url}"))

        print("--- PASSO 1: Acessando http://localhost:3000 pela primeira vez (fresh cache) ---")
        page.goto("http://localhost:3000", wait_until="domcontentloaded")
        time.sleep(3)

        page.screenshot(path="screenshots/diagnose_home_fresh.png", full_page=True)

        print("\n--- PASSO 2: Verificando imagens no DOM ---")
        images_info = page.evaluate("""() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs.map(img => ({
                src: img.src,
                complete: img.complete,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                visible: img.offsetParent !== null,
                classes: img.className
            }));
        }""")

        for i, info in enumerate(images_info):
            print(f"Img #{i}: complete={info['complete']}, naturalWidth={info['naturalWidth']}, visible={info['visible']}, src={info['src'][:80]}...")

        print("\n--- PASSO 3: Console Logs na Home ---")
        for log in console_logs:
            print(log)

        print("\n--- PASSO 4: Requests que falharam ---")
        for fail in network_failed:
            print(fail)

        print("\n--- PASSO 5: Acessando /especies ---")
        page.goto("http://localhost:3000/especies", wait_until="domcontentloaded")
        time.sleep(3)

        print("\n--- PASSO 6: Voltando para / (Home) ---")
        page.goto("http://localhost:3000", wait_until="domcontentloaded")
        time.sleep(3)
        page.screenshot(path="screenshots/diagnose_home_after_especies.png", full_page=True)

        print("\n--- PASSO 7: Dando F5 (Reload) na Home ---")
        page.reload(wait_until="domcontentloaded")
        time.sleep(3)
        page.screenshot(path="screenshots/diagnose_home_after_f5.png", full_page=True)

        images_info_f5 = page.evaluate("""() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs.map(img => ({
                src: img.src,
                complete: img.complete,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                visible: img.offsetParent !== null,
                classes: img.className
            }));
        }""")
        print("\nImagens no DOM após F5:")
        for i, info in enumerate(images_info_f5):
            print(f"Img #{i}: complete={info['complete']}, naturalWidth={info['naturalWidth']}, visible={info['visible']}, src={info['src'][:80]}...")

        browser.close()

if __name__ == "__main__":
    diagnose()
