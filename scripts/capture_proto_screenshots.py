import os
from playwright.sync_api import sync_playwright

def capture_all():
    os.makedirs("screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Figura 1: Home (Header + Hero com novo logo Fauna da Serra)
        page = browser.new_page(viewport={"width": 1280, "height": 620})
        page.goto("http://localhost:3000", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path="screenshots/proto_figura1_home.png")
        print("Captured proto_figura1_home.png")

        # 2. Figura 2: Seção Fauna em Destaque com carrossel interativo
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        page.goto("http://localhost:3000", wait_until="networkidle")
        page.wait_for_timeout(1000)
        carousel_section = page.locator("section:has-text('Fauna em Destaque')")
        carousel_section.scroll_into_view_if_needed()
        page.wait_for_timeout(600)
        carousel_section.screenshot(path="screenshots/proto_figura2_carousel.png")
        print("Captured proto_figura2_carousel.png")

        # 3. Figura 3: Formulário de Registro de Ocorrência
        page = browser.new_page(viewport={"width": 1280, "height": 1100})
        page.goto("http://localhost:3000/ocorrencias/nova", wait_until="networkidle")
        page.wait_for_timeout(1000)
        form_elem = page.locator("main > div")
        form_elem.screenshot(path="screenshots/proto_figura3_registro.png")
        print("Captured proto_figura3_registro.png")

        # 4. Figura 4: Interface Mobile (390px)
        page_mobile = browser.new_page(viewport={"width": 390, "height": 780}, is_mobile=True)
        page_mobile.goto("http://localhost:3000", wait_until="networkidle")
        page_mobile.wait_for_timeout(1000)
        page_mobile.screenshot(path="screenshots/proto_figura4_mobile.png")
        print("Captured proto_figura4_mobile.png")

        # 5. Figura 5: Central de Emergências (atualizada)
        page = browser.new_page(viewport={"width": 1280, "height": 700})
        page.goto("http://localhost:3000/emergencias", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path="screenshots/proto_figura5_emergencias.png")
        print("Captured proto_figura5_emergencias.png")

        browser.close()

if __name__ == "__main__":
    capture_all()
