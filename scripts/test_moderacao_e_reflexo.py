import time
from playwright.sync_api import sync_playwright

def test_moderacao():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        print("1. Abrindo aba de curadoria no Admin...")
        page.goto("http://localhost:3000/admin", timeout=30000)
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_selector("button:has-text('Curadoria')", timeout=15000)

        # Clica na aba Curadoria
        btn_curadoria = page.locator("button:has-text('Curadoria')").first
        btn_curadoria.click()
        time.sleep(1)

        print("2. Clicando em 'Aprovar Foto para a Galeria da Espécie'...")
        btn_aprovar = page.locator("button:has-text('Aprovar Foto')").first
        assert btn_aprovar.is_visible(), "Botão de aprovar deve estar visível"
        btn_aprovar.click()
        time.sleep(1.5)

        page.screenshot(path="screenshots/08_admin_pos_aprovacao.png", full_page=False)
        print("   -> Screenshot salvo: 08_admin_pos_aprovacao.png")

        print("3. Abrindo página pública da espécie Saruê (/especies/sarue)...")
        page.goto("http://localhost:3000/especies/sarue", timeout=30000)
        page.wait_for_load_state("domcontentloaded")
        # Espera carregar e renderizar
        time.sleep(2)

        page.screenshot(path="screenshots/09_especie_sarue_com_foto_aprovada.png", full_page=True)
        print("   -> Screenshot salvo: 09_especie_sarue_com_foto_aprovada.png")

        browser.close()
        print("Teste de moderação e reflexo imediato concluído com sucesso!")

if __name__ == "__main__":
    test_moderacao()
