import time
from playwright.sync_api import sync_playwright

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Listen for any native dialogs - if any occurs, fail!
        native_dialogs = []
        page.on("dialog", lambda dialog: native_dialogs.append(dialog.message))

        print("1. Acessando painel admin...")
        page.goto("http://localhost:3000/admin", wait_until="networkidle")
        page.wait_for_selector("aside", timeout=10000)

        # ---------------------------------------------------------
        # TESTE 1: CARROSSEL - Verificar se todas as imagens carregam
        # ---------------------------------------------------------
        print("2. Navegando para a aba 'Carrossel & Mídias da Home'...")
        page.click("button:has-text('Carrossel & Mídias da Home')")
        page.wait_for_selector("text=Controle Dinâmico do Carrossel Hero", timeout=5000)

        print("3. Verificando as mídias do carrossel...")
        # Esperar pelos cards
        cards = page.locator("div.grid > div.overflow-hidden")
        total_cards = cards.count()
        print(f"Total de cards no carrossel: {total_cards}")
        assert total_cards >= 14, f"Esperado pelo menos 14 cards, obtido {total_cards}"

        # Verificar se Lobo-guará, Jaguatirica, Tamanduá-mirim têm imagens válidas
        for nome in ["Lobo-guará", "Jaguatirica", "Tamanduá-mirim", "Urubu-rei"]:
            card_item = page.locator("div.overflow-hidden", has_text=nome).first
            assert card_item.is_visible(), f"Card para {nome} não encontrado!"
            img = card_item.locator("img").first
            src = img.get_attribute("src")
            print(f"-> {nome}: fotoUrl = {src}")
            assert src and "/images/fauna/" in src, f"Imagem inválida para {nome}: {src}"

        page.screenshot(path="screenshots/admin_carrossel_todas_imagens.png")
        print("Screenshot salvo: screenshots/admin_carrossel_todas_imagens.png")

        # ---------------------------------------------------------
        # TESTE 2: SHADCN ALERT DIALOG AO EXCLUIR NO CARROSSEL
        # ---------------------------------------------------------
        print("\n4. Testando exclusão no Carrossel com Shadcn AlertDialog...")
        test_name = f"Teste Exclusao {int(time.time())}"
        
        # Adicionar uma foto de teste para poder deletar sem violar o limite mínimo de 3
        page.click("button:has-text('Adicionar Nova Foto')")
        page.wait_for_selector("text=Adicionar Nova Imagem ao Carrossel Hero", timeout=5000)
        page.fill("input[placeholder='Ex: Capivara no Lago']", test_name)
        page.fill("input[placeholder='Ex: Hydrochoerus hydrochaeris']", "Testus deletus")
        page.fill("input[placeholder*='foto.jpg']", "/images/fauna/capivara.jpg")
        page.click("button:has-text('Confirmar Adição')")

        # Aguardar fechar o modal
        page.wait_for_selector("text=Adicionar Nova Imagem ao Carrossel Hero", state="hidden", timeout=5000)
        
        # Salvar para persistir no backend
        page.click("button:has-text('Salvar Alterações')")
        time.sleep(1.5)

        # Localizar o card recém adicionado
        card_teste = page.locator("div.overflow-hidden", has_text=test_name).first
        assert card_teste.is_visible(), "Card de teste não foi adicionado ou não está visível!"

        # Clicar no botão da lixeira do card de teste
        btn_lixeira = card_teste.locator("button[title='Excluir do carrossel']")
        btn_lixeira.click()

        # Verificar se o AlertDialog do Shadcn apareceu
        page.wait_for_selector("role=alertdialog", timeout=5000)
        assert page.locator("role=alertdialog").is_visible(), "Shadcn AlertDialog não está visível!"
        assert page.locator("role=alertdialog >> text=Remover Mídia do Carrossel").is_visible(), "Título do Shadcn AlertDialog não visível!"
        assert page.locator(f"role=alertdialog >> text={test_name}").is_visible(), "Nome do item no diálogo não visível!"
        assert len(native_dialogs) == 0, f"ERRO: Diálogo nativo do navegador foi disparado: {native_dialogs}"

        page.screenshot(path="screenshots/admin_carrossel_shadcn_alertdialog.png")
        print("Screenshot salvo: screenshots/admin_carrossel_shadcn_alertdialog.png")

        # Clicar em 'Excluir do Carrossel'
        page.click("role=alertdialog >> button:has-text('Excluir do Carrossel')")
        page.wait_for_selector("role=alertdialog", state="hidden", timeout=5000)
        time.sleep(1.5)

        # Recarregar a página para certificar persistência no backend
        page.reload(wait_until="networkidle")
        page.wait_for_selector("aside", timeout=10000)
        page.click("button:has-text('Carrossel & Mídias da Home')")
        page.wait_for_selector("text=Controle Dinâmico do Carrossel Hero", timeout=5000)

        # Garantir que o item deletado NÃO existe mais
        itens_restantes = page.locator("div.overflow-hidden", has_text=test_name).count()
        assert itens_restantes == 0, f"Item deletado ainda persiste após reload! (encontrados: {itens_restantes})"
        print("-> Exclusão no carrossel persistida com sucesso no backend!")

        # ---------------------------------------------------------
        # TESTE 3: SHADCN ALERT DIALOG AO EXCLUIR ESPÉCIE
        # ---------------------------------------------------------
        print("\n5. Testando exclusão de espécie com Shadcn AlertDialog...")
        page.click("button:has-text('Catálogo de Espécies')")
        page.wait_for_selector("input[placeholder*='Buscar por nome']", timeout=5000)

        # Filtrar por Lobo-guará
        page.fill("input[placeholder*='Buscar por nome']", "lobo-guara")
        time.sleep(0.5)

        card_lobo = page.locator("div.rounded-2xl", has_text="Lobo-guará").first
        assert card_lobo.is_visible(), "Card do Lobo-guará não encontrado!"

        # Clicar na lixeira
        btn_trash_esp = card_lobo.locator("button[title='Excluir espécie']")
        btn_trash_esp.click()

        # Verificar se o AlertDialog do Shadcn apareceu
        page.wait_for_selector("role=alertdialog", timeout=5000)
        assert page.locator("role=alertdialog >> text=Excluir Espécie do Catálogo").is_visible(), "Título do Shadcn AlertDialog de espécie não visível!"
        assert page.locator("role=alertdialog >> text=Chrysocyon brachyurus").is_visible(), "Nome científico no diálogo não visível!"
        assert len(native_dialogs) == 0, f"ERRO: Diálogo nativo do navegador foi disparado na exclusão de espécie: {native_dialogs}"

        page.screenshot(path="screenshots/admin_especie_shadcn_alertdialog.png")
        print("Screenshot salvo: screenshots/admin_especie_shadcn_alertdialog.png")

        # Clicar em Cancelar para não excluir o Lobo-guará
        page.click("role=alertdialog >> button:has-text('Cancelar')")
        page.wait_for_selector("role=alertdialog", state="hidden", timeout=3000)
        print("-> Cancelamento do diálogo Shadcn funcionou perfeitamente!")

        browser.close()
        print("\n=======================================================")
        print("TODOS OS TESTES FORAM CONCLUÍDOS COM SUCESSO! 100% APROVADO.")
        print("=======================================================")

if __name__ == "__main__":
    run_tests()
