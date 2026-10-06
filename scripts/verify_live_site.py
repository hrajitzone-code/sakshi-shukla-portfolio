import asyncio
from playwright.async_api import async_playwright

async def verify_live():
    live_url = "https://sakshi-shukla-portfolio.vercel.app"
    console_errors = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        print(f"Navigating to live Vercel website: {live_url}")
        res = await page.goto(live_url, wait_until="networkidle")
        print("HTTP Response status:", res.status)
        assert res.status == 200, f"Expected 200, got {res.status}"

        # 1. Check title & hero video
        title = await page.title()
        print("Page Title:", title)

        hero_video = page.locator("#hero video")
        assert await hero_video.count() > 0, "Hero video element missing!"
        print("Hero video present!")

        # 2. Check Resume PDF download link
        resume_btn = page.locator('a[href*=".pdf"]')
        assert await resume_btn.count() > 0, "Résumé PDF link missing!"
        pdf_href = await resume_btn.first.get_attribute("href")
        print("Résumé PDF Href:", pdf_href)

        # 3. Check Skills Periodic Table
        skills = page.locator("#skills")
        await skills.scroll_into_view_if_needed()
        await page.wait_for_timeout(500)
        skill_tiles = page.locator("#skills button.card-surface")
        tiles_count = await skill_tiles.count()
        print(f"Skills tiles count: {tiles_count}")
        assert tiles_count >= 24, f"Expected >= 24 skill tiles, found {tiles_count}"

        # 4. Check Work Section & Project Visuals
        work = page.locator("#work")
        await work.scroll_into_view_if_needed()
        await page.wait_for_timeout(500)
        project_imgs = page.locator('#work img[src*="/projects/"]')
        print("Project images count:", await project_imgs.count())

        # 5. Check desktop overflow
        d_scroll = await page.evaluate("document.documentElement.scrollWidth")
        d_inner = await page.evaluate("window.innerWidth")
        print(f"Live Desktop (1440): scrollWidth={d_scroll}, innerWidth={d_inner}")
        assert d_scroll == d_inner, f"Desktop overflow: {d_scroll} vs {d_inner}"
        await page.screenshot(path="live_desktop_1440.png", full_page=True)

        # 6. Mobile Test (390x844)
        m_page = await browser.new_page(viewport={"width": 390, "height": 844})
        m_page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        await m_page.goto(live_url, wait_until="networkidle")
        await m_page.wait_for_timeout(500)
        m_scroll = await m_page.evaluate("document.documentElement.scrollWidth")
        m_inner = await m_page.evaluate("window.innerWidth")
        print(f"Live Mobile (390): scrollWidth={m_scroll}, innerWidth={m_inner}")
        assert m_scroll == m_inner, f"Mobile overflow: {m_scroll} vs {m_inner}"
        await m_page.screenshot(path="live_mobile_390.png", full_page=True)

        # 7. Small Mobile Test (360x740)
        s_page = await browser.new_page(viewport={"width": 360, "height": 740})
        await s_page.goto(live_url, wait_until="networkidle")
        await s_page.wait_for_timeout(500)
        s_scroll = await s_page.evaluate("document.documentElement.scrollWidth")
        s_inner = await s_page.evaluate("window.innerWidth")
        print(f"Live Small Mobile (360): scrollWidth={s_scroll}, innerWidth={s_inner}")
        assert s_scroll == s_inner, f"Small Mobile overflow: {s_scroll} vs {s_inner}"

        await browser.close()
        print("Console errors detected:", console_errors)
        print("--- LIVE VERCEL WEBSITE VERIFICATION PASSED 100% ---")

if __name__ == '__main__':
    asyncio.run(verify_live())
