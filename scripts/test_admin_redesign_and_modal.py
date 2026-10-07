import time
from playwright.sync_api import sync_playwright

def test_admin_improvements():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("1. Acessando http://localhost:3000/admin...")
        page.goto("http://localhost:3000/admin", wait_until="networkidle")
        time.sleep(1)

        # Captura screenshot geral do novo layout admin
        page.screenshot(path="screenshots/admin_new_layout_sidebar.png", full_page=True)
        print("   -> Screenshot salvo: admin_new_layout_sidebar.png")

        # Verifica se o header público NÃO existe no /admin
        public_nav = page.locator("text='Guia de Espécies'").count()
        print(f"   -> Verificação de ausência de header público no /admin: {public_nav} encontrados (Esperado: 0)")
        assert public_nav == 0, "O header público ainda está vazando no /admin!"

        # Verifica se a sidebar está presente
        sidebar = page.locator("aside").first
        assert sidebar.is_visible(), "Sidebar do admin não encontrada!"
        print("   -> Sidebar do admin carregada com sucesso!")

        # Verifica o botão de Nova Espécie
        nova_esp_btn = page.locator("button:has-text('Nova Espécie')").first
        btn_text = nova_esp_btn.inner_text().strip()
        print(f"   -> Texto do botão Nova Espécie: '{btn_text}'")
        assert "+ +" not in btn_text, f"Botão ainda contém duplicidade de mais: '{btn_text}'"

        # Clica para abrir o modal de Nova Espécie
        print("\n2. Abrindo modal de Nova Espécie...")
        nova_esp_btn.click()
        time.sleep(1)

        # Captura screenshot com modal aberto (verificar backdrop)
        page.screenshot(path="screenshots/admin_modal_nova_especie_backdrop.png", full_page=True)
        print("   -> Screenshot salvo: admin_modal_nova_especie_backdrop.png")

        # Verifica se o backdrop cobre o topo (y: 0)
        backdrop_rect = page.evaluate("""() => {
            const overlay = document.querySelector('.fixed.inset-0.z-\\\\[100\\\\]');
            if (!overlay) return null;
            const r = overlay.getBoundingClientRect();
            return { top: r.top, left: r.left, width: r.width, height: r.height };
        }""")
        print(f"   -> Retângulo do Backdrop: {backdrop_rect}")
        assert backdrop_rect is not None and backdrop_rect["top"] == 0, "Backdrop não está ocupando o topo da tela!"

        # Verifica se os hints estão visíveis no modal
        hints = page.locator("text=Nome comum pelo qual a comunidade").count()
        print(f"   -> Hints taxonômicos encontrados no formulário: {hints}")
        assert hints > 0, "Hints não foram encontrados no formulário!"

        # Fecha o modal clicando no botão X
        print("\n3. Fechando modal via botão X...")
        close_btn = page.locator("button[title='Fechar modal']").first
        close_btn.click()
        time.sleep(0.5)

        # Testa edição de uma espécie existente (Capivara) e o Lightbox
        print("\n4. Abrindo edição da primeira espécie para testar prévia e ampliação...")
        edit_btn = page.locator("button:has-text('Editar')").first
        edit_btn.click()
        time.sleep(1)

        page.screenshot(path="screenshots/admin_modal_editar_preview.png", full_page=True)
        print("   -> Screenshot salvo: admin_modal_editar_preview.png")

        # Clica para ampliar a foto
        print("\n5. Clicando para ampliar a fotografia (Lightbox)...")
        ampliar_btn = page.locator("button:has-text('Ampliar foto')").first
        ampliar_btn.click()
        time.sleep(1)

        # Captura screenshot da imagem ampliada em tela cheia
        page.screenshot(path="screenshots/admin_lightbox_ampliado.png", full_page=True)
        print("   -> Screenshot salvo: admin_lightbox_ampliado.png")

        # Fecha o lightbox clicando no botão Fechar
        print("   -> Fechando lightbox...")
        fechar_lightbox = page.locator("button[title='Fechar visualização']").first
        fechar_lightbox.click()
        time.sleep(0.5)

        # Fecha o modal de edição
        page.locator("button[title='Fechar modal']").first.click()
        time.sleep(0.5)

        # Testa troca de abas na Sidebar
        print("\n6. Alternando abas na Sidebar...")
        page.locator("button:has-text('Carrossel & Mídias da Home')").first.click()
        time.sleep(1)
        page.screenshot(path="screenshots/admin_tab_carrossel.png", full_page=True)
        print("   -> Screenshot salvo: admin_tab_carrossel.png")

        page.locator("button:has-text('Curadoria de Ocorrências')").first.click()
        time.sleep(1)
        page.screenshot(path="screenshots/admin_tab_curadoria.png", full_page=True)
        print("   -> Screenshot salvo: admin_tab_curadoria.png")

        # Testa layout Mobile (390x844)
        print("\n7. Testando ergonomia no Mobile (390x844)...")
        page.set_viewport_size({"width": 390, "height": 844})
        time.sleep(1)
        page.screenshot(path="screenshots/admin_mobile_home.png", full_page=False)
        print("   -> Screenshot salvo: admin_mobile_home.png")

        # Abre o menu lateral mobile via botão hamburger
        print("   -> Abrindo menu lateral mobile (hamburger)...")
        hamburger = page.locator("button[aria-label='Abrir menu lateral']").first
        hamburger.click()
        time.sleep(1)
        page.screenshot(path="screenshots/admin_mobile_sidebar_open.png", full_page=False)
        print("   -> Screenshot salvo: admin_mobile_sidebar_open.png")

        # Testa a Home pública para garantir que ela continua 100% íntegra
        print("\n8. Testando acesso ao site público http://localhost:3000...")
        page.set_viewport_size({"width": 1440, "height": 900})
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(1)
        home_public_nav = page.locator("text='Guia de Espécies'").count()
        print(f"   -> Verificação do header público na Home: {home_public_nav} encontrados (Esperado: > 0)")
        assert home_public_nav > 0, "O header público sumiu da Home!"

        browser.close()
        print("\n TODOS OS TESTES DO NOVO ADMIN E MODAIS FORAM CONCLUÍDOS COM SUCESSO!")

if __name__ == "__main__":
    test_admin_improvements()
