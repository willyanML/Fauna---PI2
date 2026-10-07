import time
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        print("1. Testando Home pública (http://localhost:3000)...")
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(1)

        # 1.1 Verifica ausência do botão Admin no header público
        admin_links = page.locator("header a[href='/admin']").count()
        print(f"   -> Links para /admin no header público: {admin_links} (Esperado: 0)")
        assert admin_links == 0, "O botão Admin ainda está visível no header público!"

        # 1.2 Captura screenshot da Home sem botão de admin
        page.screenshot(path="screenshots/home_sem_botao_admin.png", full_page=False)
        print("   -> Screenshot salvo: home_sem_botao_admin.png")

        # 1.3 Verifica na visualização mobile (390x844) se o drawer não tem link de admin
        print("\n2. Testando menu gaveta mobile na Home...")
        page.set_viewport_size({"width": 390, "height": 844})
        time.sleep(0.5)
        # Abre o drawer
        page.locator("button.md\\:hidden, div.md\\:hidden button").first.click()
        time.sleep(0.5)
        drawer_admin_links = page.locator("a[href='/admin']").count()
        print(f"   -> Links para /admin no menu gaveta mobile: {drawer_admin_links} (Esperado: 0)")
        assert drawer_admin_links == 0, "O link de Admin ainda está presente no drawer mobile!"
        page.screenshot(path="screenshots/mobile_drawer_sem_admin.png", full_page=False)
        print("   -> Screenshot salvo: mobile_drawer_sem_admin.png")

        # Fecha o drawer e restaura viewport desktop
        page.locator("button[aria-label='Fechar menu'], div.fixed button").first.click()
        time.sleep(0.5)
        page.set_viewport_size({"width": 1440, "height": 900})

        # 2. Testando Guia de Espécies com as 14 espécies
        print("\n3. Acessando Guia de Espécies (http://localhost:3000/especies)...")
        page.goto("http://localhost:3000/especies", wait_until="networkidle")
        time.sleep(1)

        total_cards = page.locator("a[href^='/especies/']").count()
        print(f"   -> Total de espécies exibidas no guia: {total_cards} (Esperado: >= 14)")
        assert total_cards >= 14, f"Esperado >= 14 espécies, encontrado {total_cards}"

        # Verifica novas espécies no guia
        for nome in ["Lobo-guará", "Jaguatirica", "Tamanduá-mirim", "Urubu-rei"]:
            count = page.locator(f"text={nome}").count()
            print(f"      - {nome}: {count} ocorrência(s) encontrada(s)")
            assert count > 0, f"Espécie {nome} não encontrada no Guia!"

        page.screenshot(path="screenshots/especies_com_novas_massas.png", full_page=False)
        print("   -> Screenshot salvo: especies_com_novas_massas.png")

        # 3. Testando Ficha Detalhada de uma das novas espécies (Lobo-guará)
        print("\n4. Acessando ficha detalhada do Lobo-guará (/especies/lobo-guara)...")
        page.goto("http://localhost:3000/especies/lobo-guara", wait_until="networkidle")
        time.sleep(1)
        lobo_title = page.locator("h1:has-text('Lobo-guará')").count()
        assert lobo_title > 0, "Página da espécie Lobo-guará não carregou!"
        page.screenshot(path="screenshots/especie_lobo_guara_detalhe.png", full_page=True)
        print("   -> Screenshot salvo: especie_lobo_guara_detalhe.png")

        # 4. Testando Painel Administrativo (/admin) diretamente pela URL
        print("\n5. Acessando http://localhost:3000/admin diretamente pela URL...")
        page.goto("http://localhost:3000/admin", wait_until="networkidle")
        time.sleep(1)

        # Verifica estatísticas do painel
        admin_especies_count = page.locator("text=14").count()
        print(f"   -> Indicadores com 14 espécies no Admin: {admin_especies_count}")
        page.screenshot(path="screenshots/admin_com_14_especies.png", full_page=True)
        print("   -> Screenshot salvo: admin_com_14_especies.png")

        # Testa edição e lightbox na Jaguatirica
        print("\n6. Filtrando Jaguatirica no Admin e testando Lightbox...")
        page.locator("input[placeholder*='Buscar por nome']").fill("Jaguatirica")
        time.sleep(0.5)
        page.locator("button:has-text('Editar')").first.click()
        time.sleep(1)
        page.screenshot(path="screenshots/admin_editar_jaguatirica.png", full_page=True)
        print("   -> Screenshot salvo: admin_editar_jaguatirica.png")

        page.locator("button:has-text('Ampliar foto')").first.click()
        time.sleep(1)
        page.screenshot(path="screenshots/admin_lightbox_jaguatirica.png", full_page=True)
        print("   -> Screenshot salvo: admin_lightbox_jaguatirica.png")

        # Fecha o lightbox e o modal
        page.locator("button[title='Fechar visualização']").first.click()
        time.sleep(0.5)
        page.locator("button[title='Fechar modal']").first.click()
        time.sleep(0.5)

        # 5. Testa Curadoria com ocorrência pendente do Urubu-rei
        print("\n7. Testando Curadoria de Ocorrências com nova pendência...")
        page.locator("button:has-text('Curadoria de Ocorrências')").first.click()
        time.sleep(1)
        urubu_pendente = page.locator("text=Urubu-rei").count()
        print(f"   -> Ocorrência pendente do Urubu-rei encontrada: {urubu_pendente}")
        assert urubu_pendente > 0, "Ocorrência pendente do Urubu-rei não encontrada na curadoria!"
        page.screenshot(path="screenshots/admin_curadoria_urubu_rei.png", full_page=True)
        print("   -> Screenshot salvo: admin_curadoria_urubu_rei.png")

        browser.close()
        print("\n TODOS OS TESTES DE REMOÇÃO DO BOTÃO ADMIN E NOVAS MASSAS DE DADOS FORAM APROVADOS COM SUCESSO!")

if __name__ == "__main__":
    verify()
