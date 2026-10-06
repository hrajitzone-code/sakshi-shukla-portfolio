import asyncio
from playwright.async_api import async_playwright

async def run_verification():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        sizes = [
            ("desktop_1440x900", 1440, 900),
            ("mobile_390x844", 390, 844),
            ("mobile_360x740", 360, 740),
        ]

        for name, w, h in sizes:
            page = await browser.new_page(viewport={"width": w, "height": h})
            await page.goto("http://localhost:3000", wait_until="networkidle")
            await page.wait_for_timeout(800)

            # Check overflow
            scroll_width = await page.evaluate("document.documentElement.scrollWidth")
            inner_width = await page.evaluate("window.innerWidth")
            print(f"[{name}] scrollWidth={scroll_width}, innerWidth={inner_width}")
            assert scroll_width == inner_width, f"Overflow on {name}! {scroll_width} vs {inner_width}"

            # Capture Hero section screenshot
            hero = page.locator("#hero")
            await hero.screenshot(path=f"verify_hero_{name}.png")

            # Capture Work section screenshot
            work = page.locator("#work")
            await work.scroll_into_view_if_needed()
            await page.wait_for_timeout(400)
            await work.screenshot(path=f"verify_work_{name}.png")

            await page.close()

        # Check ID Card Flip on desktop
        page_card = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page_card.goto("http://localhost:3000", wait_until="networkidle")
        about = page_card.locator("#about")
        await about.scroll_into_view_if_needed()
        await page_card.wait_for_timeout(400)

        card_btn = page_card.locator('#about [role="button"]')
        await card_btn.click()
        await page_card.wait_for_timeout(600)
        await about.screenshot(path="verify_id_card_flipped.png")

        await browser.close()
        print("--- ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY ---")

if __name__ == '__main__':
    asyncio.run(run_verification())
