import asyncio
from playwright.async_api import async_playwright

async def test_site():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # 1. Desktop Test (1440x900)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # Check scrollWidth vs innerWidth
        scroll_width = await page.evaluate("document.documentElement.scrollWidth")
        inner_width = await page.evaluate("window.innerWidth")
        print(f"Desktop (1440x900): scrollWidth={scroll_width}, innerWidth={inner_width}")
        assert scroll_width == inner_width, f"Horizontal overflow detected on desktop! {scroll_width} vs {inner_width}"

        await page.screenshot(path="screenshot-1440x900.png", full_page=True)
        print("Saved screenshot-1440x900.png")

        # 2. Mobile Test (390x844)
        mobile_page = await browser.new_page(viewport={"width": 390, "height": 844})
        await mobile_page.goto("http://localhost:3000", wait_until="networkidle")
        await mobile_page.wait_for_timeout(1000)

        m_scroll_width = await mobile_page.evaluate("document.documentElement.scrollWidth")
        m_inner_width = await mobile_page.evaluate("window.innerWidth")
        print(f"Mobile (390x844): scrollWidth={m_scroll_width}, innerWidth={m_inner_width}")
        assert m_scroll_width == m_inner_width, f"Horizontal overflow detected on mobile! {m_scroll_width} vs {m_inner_width}"

        await mobile_page.screenshot(path="screenshot-390x844.png", full_page=True)
        print("Saved screenshot-390x844.png")

        await browser.close()
        print("--- ALL PLAYWRIGHT TESTS PASSED CLEANLY ---")

if __name__ == '__main__':
    asyncio.run(test_site())
