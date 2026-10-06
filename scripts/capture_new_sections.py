import asyncio
from playwright.async_api import async_playwright

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # 1. Skills section screenshot
        skills = page.locator("#skills")
        await skills.scroll_into_view_if_needed()
        await page.wait_for_timeout(600)
        await page.screenshot(path="verify_skills_section.png")

        # 2. Work section screenshot
        work = page.locator("#work")
        await work.scroll_into_view_if_needed()
        await page.wait_for_timeout(600)
        await page.screenshot(path="verify_work_new_projects.png")

        await browser.close()
        print("Captured verify_skills_section.png and verify_work_new_projects.png")

if __name__ == '__main__':
    asyncio.run(capture())
