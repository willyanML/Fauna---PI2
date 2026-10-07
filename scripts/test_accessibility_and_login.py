import os
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\willy\.gemini\antigravity-cli\brain\101fccd4-3cc9-4b07-a945-bf01180cbfa8"

def run_tests():
    print("Iniciando testes automatizados com Playwright...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # -------------------------------------------------------------
        # TESTE 1: Site Público e Barra de Acessibilidade Governamental
        # -------------------------------------------------------------
        print("\n--- Testando Site Público & Acessibilidade ---")
        page.goto("http://localhost:3000")
        page.wait_for_function("() => document.documentElement.style.fontSize !== ''", timeout=20000)

        # Verifica presenca da barra de acessibilidade
        toolbar = page.locator('[aria-label="Barra de Acessibilidade Governamental"]')
        assert toolbar.is_visible(), "Barra de acessibilidade deve estar visivel"
        print("[OK] Barra de acessibilidade encontrada no topo")

        btn_aumentar = page.locator('#btn-font-increase')
        btn_normal = page.locator('#btn-font-reset')
        btn_diminuir = page.locator('#btn-font-decrease')

        assert btn_aumentar.is_visible(), "Botao A+ deve estar visivel"
        assert btn_diminuir.is_visible(), "Botao A- deve estar visivel"

        # Tira screenshot inicial (100%)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "acessibilidade_fonte_padrao_100.png"))
        print("[OK] Screenshot capturado: acessibilidade_fonte_padrao_100.png")

        font_size_init = page.evaluate("() => document.documentElement.style.fontSize")
        print(f"[DEBUG] fontSize inicial: '{font_size_init}'")

        # Clica A+ para aumentar a fonte
        btn_aumentar.click()
        time.sleep(1)
        font_size = page.evaluate("() => document.documentElement.style.fontSize")
        print(f"[OK] Tamanho da fonte apos A+: {font_size}")
        assert font_size in ["115%", "125%"], f"Tamanho inesperado: {font_size}"

        page.screenshot(path=os.path.join(ARTIFACT_DIR, "acessibilidade_fonte_aumentada_115.png"))
        print("[OK] Screenshot capturado: acessibilidade_fonte_aumentada_115.png")

        # Clica A para restaurar
        btn_normal.click()
        time.sleep(0.5)
        font_size_reset = page.evaluate("() => document.documentElement.style.fontSize")
        print(f"[OK] Tamanho da fonte apos A (reset): {font_size_reset}")
        assert font_size_reset == "100%", f"Reset falhou: {font_size_reset}"

        # -------------------------------------------------------------
        # TESTE 2: Area Administrativa (/admin) - Tela de Login Exclusiva
        # -------------------------------------------------------------
        print("\n--- Testando Tela de Login Exclusiva do Admin ---")
        page.goto("http://localhost:3000/admin", wait_until="networkidle")
        time.sleep(1)

        # Deve mostrar o formulario de login (nao deve mostrar o painel)
        input_usuario = page.locator('input#usuario')
        input_senha = page.locator('input#senha')
        btn_entrar = page.locator('button:has-text("Entrar no Painel")')

        assert input_usuario.is_visible(), "Campo Usuario deve estar presente"
        assert input_senha.is_visible(), "Campo Senha deve estar presente"
        assert btn_entrar.is_visible(), "Botao Entrar deve estar presente"
        print("[OK] Formulario de login exibido com campos Usuario e Senha")

        page.screenshot(path=os.path.join(ARTIFACT_DIR, "admin_login_tela.png"))
        print("[OK] Screenshot capturado: admin_login_tela.png")

        # -------------------------------------------------------------
        # TESTE 3: Tentativa de Login com Credenciais Invalidas
        # -------------------------------------------------------------
        print("\n--- Testando Login com Credenciais Invalidas ---")
        input_usuario.fill("usuario_errado")
        input_senha.fill("senha_errada")
        btn_entrar.click()
        time.sleep(1)

        # Deve exibir alerta de erro
        alert_erro = page.locator('text=Usuário ou senha incorretos')
        assert alert_erro.is_visible(), "Mensagem de erro deve ser exibida para credenciais invalidas"
        print("[OK] Alerta de erro exibido corretamente com credenciais incorretas")

        page.screenshot(path=os.path.join(ARTIFACT_DIR, "admin_login_erro.png"))
        print("[OK] Screenshot capturado: admin_login_erro.png")

        # -------------------------------------------------------------
        # TESTE 4: Login Valido com faunadaserra / fauna2026pi2
        # -------------------------------------------------------------
        print("\n--- Testando Login Valido (faunadaserra / fauna2026pi2) ---")
        input_usuario.fill("faunadaserra")
        input_senha.fill("fauna2026pi2")
        btn_entrar.click()
        time.sleep(2)

        # Deve carregar o painel administrativo
        catalogo_heading = page.locator('h1:has-text("Catálogo de Espécies Nativas")')
        assert catalogo_heading.is_visible(), "Painel administrativo deve ser carregado apos login"
        print("[OK] Login realizado com sucesso! Painel administrativo exibido.")

        page.screenshot(path=os.path.join(ARTIFACT_DIR, "admin_painel_autenticado.png"))
        print("[OK] Screenshot capturado: admin_painel_autenticado.png")

        # -------------------------------------------------------------
        # TESTE 5: Logout (Encerrar Sessao)
        # -------------------------------------------------------------
        print("\n--- Testando Logout Administrativo ---")
        btn_logout = page.locator('button[title="Encerrar sessão de administrador"]').first
        assert btn_logout.is_visible(), "Botao de logout deve estar visivel no topo"
        btn_logout.click()
        time.sleep(1)

        # Apos logout, deve retornar para a tela de login
        assert input_usuario.is_visible(), "Apos logout, deve exibir o formulario de login"
        print("[OK] Logout realizado com sucesso! Retornou a tela de login.")

        page.screenshot(path=os.path.join(ARTIFACT_DIR, "admin_logout_sucesso.png"))
        print("[OK] Screenshot capturado: admin_logout_sucesso.png")

        browser.close()
        print("\n=== TODOS OS TESTES PASSARAM COM SUCESSO! ===")

if __name__ == "__main__":
    run_tests()
