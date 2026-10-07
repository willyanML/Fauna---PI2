import time
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Fresh context with completely empty cache
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        print("1. Acessando http://localhost:3000 pela primeira vez (fresh cache)...")
        page.goto("http://localhost:3000", wait_until="domcontentloaded")
        time.sleep(2)

        # Captura screenshot inicial
        page.screenshot(path="screenshots/verify_local_home_fresh.png", full_page=True)
        print("   -> Screenshot salvo: verify_local_home_fresh.png")

        # Avalia imagens
        imgs_fresh = page.evaluate("""() => {
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

        total_fresh = len(imgs_fresh)
        loaded_fresh = sum(1 for img in imgs_fresh if img['complete'] and img['naturalWidth'] > 0)
        print(f"   -> Imagens no primeiro acesso: {loaded_fresh}/{total_fresh} carregadas com sucesso!")
        for i, img in enumerate(imgs_fresh[:5]):
            print(f"      Img #{i}: {img['src']} | naturalWidth: {img['naturalWidth']}")

        print("\n2. Pressionando F5 (Reload da página inicial)...")
        page.reload(wait_until="domcontentloaded")
        time.sleep(2)

        # Captura screenshot após F5
        page.screenshot(path="screenshots/verify_local_home_after_f5.png", full_page=True)
        print("   -> Screenshot salvo: verify_local_home_after_f5.png")

        imgs_f5 = page.evaluate("""() => {
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

        total_f5 = len(imgs_f5)
        loaded_f5 = sum(1 for img in imgs_f5 if img['complete'] and img['naturalWidth'] > 0)
        print(f"   -> Imagens após F5: {loaded_f5}/{total_f5} carregadas com sucesso!")

        assert loaded_f5 > 0 and loaded_f5 == total_f5, f"Esperado todas as {total_f5} imagens carregadas após F5, mas {loaded_f5} carregaram."

        # Testa também página /especies
        print("\n3. Acessando http://localhost:3000/especies...")
        page.goto("http://localhost:3000/especies", wait_until="domcontentloaded")
        time.sleep(2)
        page.screenshot(path="screenshots/verify_local_especies.png", full_page=False)
        print("   -> Screenshot salvo: verify_local_especies.png")

        # Testa página /especies/capivara
        print("\n4. Acessando http://localhost:3000/especies/capivara...")
        page.goto("http://localhost:3000/especies/capivara", wait_until="domcontentloaded")
        time.sleep(2)
        page.screenshot(path="screenshots/verify_local_especie_detalhe.png", full_page=True)
        print("   -> Screenshot salvo: verify_local_especie_detalhe.png")

        browser.close()
        print("\n TODOS OS TESTES DE IMAGENS LOCAIS E F5 FORAM APROVADOS COM SUCESSO!")

if __name__ == "__main__":
    verify()
