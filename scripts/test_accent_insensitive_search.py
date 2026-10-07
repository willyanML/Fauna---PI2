import time
from playwright.sync_api import sync_playwright

def test_search():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        print("1. Testando busca no Guia de Espécies (http://localhost:3000/especies)...")
        page.goto("http://localhost:3000/especies", wait_until="networkidle")
        time.sleep(1)

        search_input = page.locator("input[placeholder*='Pesquisar']")

        # Casos de teste: (termo_busca, nome_esperado)
        test_cases = [
            ("tamandua", "Tamanduá", "Sem acento (tamandua -> Tamanduá)"),
            ("tamanduá", "Tamanduá", "Com acento (tamanduá -> Tamanduá)"),
            ("onca", "Onça-parda", "Sem cedilha/acento (onca -> Onça-parda)"),
            ("onça", "Onça-parda", "Com cedilha (onça -> Onça-parda)"),
            ("sarue", "Saruê", "Sem acento circunflexo (sarue -> Saruê)"),
            ("saruê", "Saruê", "Com acento circunflexo (saruê -> Saruê)"),
            ("lobo guara", "Lobo-guará", "Sem hífen e sem acento (lobo guara -> Lobo-guará)"),
            ("lobo-guará", "Lobo-guará", "Com hífen e com acento (lobo-guará -> Lobo-guará)"),
            ("carcara", "Carcará", "Sem acento agudo (carcara -> Carcará)"),
            ("carcará", "Carcará", "Com acento agudo (carcará -> Carcará)"),
            ("teiu", "Teiú", "Sem acento (teiu -> Teiú)"),
            ("teiú", "Teiú", "Com acento (teiú -> Teiú)"),
        ]

        for termo, esperado, desc in test_cases:
            search_input.fill("")
            time.sleep(0.1)
            search_input.fill(termo)
            time.sleep(0.3)
            
            count = page.locator(f"h3:has-text('{esperado}')").count()
            print(f"   [{desc}] Busca '{termo}': {count} resultado(s) para '{esperado}'")
            assert count > 0, f"Falha na busca '{termo}' para encontrar '{esperado}'!"

        # Captura screenshot da busca "tamandua" (sem acento) exibindo Tamanduá-bandeira e Tamanduá-mirim
        search_input.fill("tamandua")
        time.sleep(0.3)
        page.screenshot(path="screenshots/busca_especies_sem_acento_tamandua.png", full_page=False)
        print("   -> Screenshot salvo: busca_especies_sem_acento_tamandua.png")

        # Captura screenshot da busca "onca" (sem cedilha)
        search_input.fill("onca")
        time.sleep(0.3)
        page.screenshot(path="screenshots/busca_especies_sem_cedilha_onca.png", full_page=False)
        print("   -> Screenshot salvo: busca_especies_sem_cedilha_onca.png")

        # 2. Testando busca no Painel Administrativo (/admin)
        print("\n2. Testando busca no Painel Administrativo (http://localhost:3000/admin)...")
        page.goto("http://localhost:3000/admin", wait_until="networkidle")
        time.sleep(1)

        admin_search = page.locator("input[placeholder*='Buscar']")

        admin_test_cases = [
            ("tamandua", "Tamanduá", "Admin: sem acento (tamandua)"),
            ("tamanduá", "Tamanduá", "Admin: com acento (tamanduá)"),
            ("onca", "Onça-parda", "Admin: sem cedilha (onca)"),
            ("sarue", "Saruê", "Admin: sem acento (sarue)"),
            ("lobo guara", "Lobo-guará", "Admin: sem hífen e sem acento (lobo guara)")
        ]

        for termo, esperado, desc in admin_test_cases:
            admin_search.fill("")
            time.sleep(0.1)
            admin_search.fill(termo)
            time.sleep(0.3)

            count = page.locator(f"h3:has-text('{esperado}')").count()
            print(f"   [{desc}] Busca '{termo}': {count} resultado(s) para '{esperado}'")
            assert count > 0, f"Falha no Admin com busca '{termo}' para '{esperado}'!"

        # Captura screenshot da busca no admin
        admin_search.fill("lobo guara")
        time.sleep(0.3)
        page.screenshot(path="screenshots/admin_busca_sem_acento_lobo_guara.png", full_page=False)
        print("   -> Screenshot salvo: admin_busca_sem_acento_lobo_guara.png")

        browser.close()
        print("\n TODOS OS TESTES DE BUSCA COM E SEM ACENTO FORAM APROVADOS COM SUCESSO!")

if __name__ == "__main__":
    test_search()
