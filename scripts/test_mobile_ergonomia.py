import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        # Emula iPhone 14 Pro
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page = context.new_page()

        print("1. Acessando Home no celular (390x844)...")
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(1)

        # Captura Home com Bottom Nav
        page.screenshot(path="screenshots/mobile_home_bottom_nav.png")
        print("   -> Salvo screenshots/mobile_home_bottom_nav.png")

        # 2. Testa abertura do Drawer Lateral
        print("2. Testando abertura do Mobile Drawer (Menu Hambúrguer)...")
        btn_menu = page.locator('button[aria-label="Abrir menu de navegação"]')
        assert btn_menu.is_visible(), "Botão de menu hambúrguer deve estar visível no mobile"
        btn_menu.click()
        time.sleep(0.5)

        drawer = page.locator('aside[aria-label="Menu principal"]')
        assert drawer.is_visible(), "Drawer lateral deve estar visível após clique no hambúrguer"
        page.screenshot(path="screenshots/mobile_drawer_open.png")
        print("   -> Salvo screenshots/mobile_drawer_open.png")

        # Fecha o drawer
        btn_close = page.locator('button[aria-label="Fechar menu"]')
        btn_close.click()
        time.sleep(0.5)

        # 3. Testa Guia de Espécies com Filtros por Toque
        print("3. Testando Guia de Espécies com filtros móveis...")
        page.goto("http://localhost:3000/especies", wait_until="networkidle")
        time.sleep(1)

        # Filtro Aves
        btn_aves = page.locator('button:has-text("Aves")')
        btn_aves.click()
        time.sleep(0.5)
        page.screenshot(path="screenshots/mobile_especies_filtro_aves.png")
        print("   -> Salvo screenshots/mobile_especies_filtro_aves.png")

        # Filtro Ameaçadas
        btn_ameacadas = page.locator('button:has-text("Ameaçadas")')
        btn_ameacadas.click()
        time.sleep(0.5)
        page.screenshot(path="screenshots/mobile_especies_ameacadas.png")
        print("   -> Salvo screenshots/mobile_especies_ameacadas.png")

        # 4. Testa Formulário de Ocorrências com Câmera de Campo
        print("4. Testando Formulário de Campo (/ocorrencias/nova)...")
        page.goto("http://localhost:3000/ocorrencias/nova", wait_until="networkidle")
        time.sleep(1)

        input_file = page.locator('input[type="file"]')
        capture_attr = input_file.get_attribute("capture")
        assert capture_attr == "environment", f"Input deve ter capture='environment', obtido: {capture_attr}"
        print(f"   -> Verificado capture='{capture_attr}' com sucesso para acionamento de câmera traseira!")

        page.screenshot(path="screenshots/mobile_ocorrencias_nova.png")
        print("   -> Salvo screenshots/mobile_ocorrencias_nova.png")

        browser.close()
        print("\nTodos os testes de ergonomia mobile passaram com 100% de sucesso!")

if __name__ == "__main__":
    run()
