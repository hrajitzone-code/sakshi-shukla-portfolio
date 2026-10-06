import asyncio
from playwright.async_api import async_playwright

async def inspect_ui():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1440, 'height': 900})
        await page.goto('http://localhost:3000', wait_until='networkidle')
        await page.wait_for_timeout(1000)

        # 1. Screenshot Work section card spines
        work_sec = page.locator('#work')
        await work_sec.scroll_into_view_if_needed()
        await page.wait_for_timeout(500)
        await page.screenshot(path='test_work_spines.png')

        # 2. Click ID card in About section to flip it
        about_sec = page.locator('#about')
        await about_sec.scroll_into_view_if_needed()
        await page.wait_for_timeout(500)
        # Click the card wrapper
        card = page.locator('#about [role="button"]')
        await card.click()
        await page.wait_for_timeout(800)
        await page.screenshot(path='test_id_card_back.png')

        await browser.close()
        print('Screenshots saved: test_work_spines.png, test_id_card_back.png')

if __name__ == '__main__':
    asyncio.run(inspect_ui())
