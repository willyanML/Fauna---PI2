import os
import asyncio
from playwright.async_api import async_playwright
from PIL import Image

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 512, "height": 512})
        
        svg_path = os.path.abspath("public/icon.svg")
        file_url = f"file:///{svg_path.replace(os.sep, '/')}"
        
        await page.goto(file_url)
        # Tira screenshot transparente do SVG em 512x512
        png_path = "public/icon-512.png"
        svg_el = await page.wait_for_selector("svg")
        await svg_el.screenshot(path=png_path, omit_background=True)
        await browser.close()
        print("Renderizado PNG 512x512 com sucesso!")

    # Gera tamanhos adicionais com Pillow e o favicon.ico
    img = Image.open("public/icon-512.png")
    
    # Apple touch icon (180x180)
    img_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save("public/apple-touch-icon.png")
    img_180.save("src/app/apple-icon.png")
    
    # Favicon ICO contendo múltiplos tamanhos (16, 32, 48)
    sizes = [(16, 16), (32, 32), (48, 48)]
    img.save("public/favicon.ico", format="ICO", sizes=sizes)
    img.save("src/app/favicon.ico", format="ICO", sizes=sizes)
    print("Favicon.ico multi-resolução e apple-touch-icon gerados com sucesso!")

asyncio.run(main())
