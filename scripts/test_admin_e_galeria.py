import os
import sys
import time
from playwright.sync_api import sync_playwright

def run_tests():
    os.makedirs("screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Desktop context
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        print("1. Acessando Home page...")
        page.goto("http://localhost:3000/", timeout=30000)
        page.wait_for_load_state("domcontentloaded")
        time.sleep(1)
        page.screenshot(path="screenshots/01_home_com_carrossel_dinamico.png", full_page=False)
        print("   -> Screenshot salvo: 01_home_com_carrossel_dinamico.png")

        print("2. Acessando Painel Administrativo (/admin)...")
        page.goto("http://localhost:3000/admin", timeout=30000)
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_selector("button:has-text('CRUD')", timeout=15000)
        time.sleep(1)
        page.screenshot(path="screenshots/02_admin_visao_geral.png", full_page=False)
        print("   -> Screenshot salvo: 02_admin_visao_geral.png")

        print("3. Testando aba Catálogo de Espécies...")
        btn_especies = page.locator("button:has-text('CRUD')")
        btn_especies.click()
        time.sleep(1)
        page.screenshot(path="screenshots/03_admin_especies_tab.png", full_page=False)
        print("   -> Screenshot salvo: 03_admin_especies_tab.png")

        print("4. Testando Modal de Nova Espécie...")
        btn_nova_especie = page.locator("button:has-text('Nova')").first
        btn_nova_especie.click()
        time.sleep(1)
        page.screenshot(path="screenshots/04_admin_modal_nova_especie.png", full_page=False)
        print("   -> Screenshot salvo: 04_admin_modal_nova_especie.png")

        # Fechar modal
        btn_cancelar = page.locator("button:has-text('Cancelar')")
        btn_cancelar.click()
        time.sleep(0.5)

        print("5. Testando aba Curadoria de Ocorrências...")
        btn_curadoria = page.locator("button:has-text('Curadoria')").first
        btn_curadoria.click()
        time.sleep(1)
        page.screenshot(path="screenshots/05_admin_curadoria_tab.png", full_page=False)
        print("   -> Screenshot salvo: 05_admin_curadoria_tab.png")

        print("6. Acessando Ficha Biológica e Galeria Comunitária (/especies/capivara)...")
        page.goto("http://localhost:3000/especies/capivara", timeout=30000)
        page.wait_for_load_state("domcontentloaded")
        time.sleep(1)
        page.screenshot(path="screenshots/06_especie_detalhe_galeria_bairros.png", full_page=True)
        print("   -> Screenshot salvo: 06_especie_detalhe_galeria_bairros.png")

        # Mobile context
        print("7. Testando responsividade mobile do Painel Admin...")
        mobile_context = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        )
        mobile_page = mobile_context.new_page()
        mobile_page.goto("http://localhost:3000/admin", timeout=30000)
        mobile_page.wait_for_load_state("domcontentloaded")
        mobile_page.wait_for_selector("button:has-text('CRUD')", timeout=15000)
        time.sleep(1)
        mobile_page.screenshot(path="screenshots/07_admin_mobile_view.png", full_page=True)
        print("   -> Screenshot salvo: 07_admin_mobile_view.png")

        browser.close()
        print("Todos os testes do Playwright foram executados com sucesso!")

if __name__ == "__main__":
    run_tests()
