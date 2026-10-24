"""Phase 1 UI checks; network package checks are audited separately."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'verification'


async def verify(page, native):
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    await page.locator('.tool-card').first.wait_for()
    if await page.get_by_role('button', name='Open dashboard', exact=True).count():
        await page.get_by_role('button', name='Open dashboard', exact=True).click()
    assert await page.locator('.tool-card').count() == 53
    assert await page.locator('.filter').count() == 10
    assert await page.evaluate('!!window.hubx') == native
    name = 'native' if native else 'browser'
    await page.screenshot(path=str(OUT / f'phase1-{name}-dashboard.png'))
    search = page.get_by_role('searchbox', name='Search projects')
    await search.fill('whisper')
    assert await page.locator('.tool-card').count() == 2
    await search.fill('not-a-real-project-000')
    assert await page.locator('.tool-card').count() == 0
    assert await page.locator('.empty').is_visible()
    await search.fill('')
    await page.get_by_role('button', name='Video', exact=True).click()
    assert await page.locator('.tool-card').count() == 6
    await page.get_by_role('button', name='Creative suite', exact=True).click()
    assert await page.locator('.tool-card').count() == 14
    await page.get_by_role('button', name='All', exact=True).click()
    # Verify every guide renders with its dated provenance and walkthrough.
    titles = await page.locator('.tool-card h2').all_text_contents()
    for title in titles:
        card = page.locator('.tool-card').filter(has=page.get_by_role('heading', name=title, exact=True))
        await card.get_by_role('button', name='Details', exact=True).click()
        dialog = page.get_by_role('dialog')
        assert await dialog.get_attribute('aria-labelledby') == 'modal-title'
        assert await dialog.locator('.catalog-guide').is_visible()
        assert await dialog.locator('.catalog-guide ol li').count() >= 3
        assert '2026-10-18' in await dialog.locator('.catalog-guide').inner_text()
        if title == 'WordCraft':
            assert 'v0.8.0' in await dialog.inner_text()
            await page.screenshot(path=str(OUT / f'phase1-{name}-wordcraft.png'))
        if title == 'Voicebox':
            text = await dialog.inner_text()
            assert 'fork has no published installers' in text
            assert 'jamiepine/voicebox' in text
        if title == 'Flowise':
            assert 'Archived repository' in await dialog.inner_text()
        await page.keyboard.press('Escape')
        assert await page.locator('dialog[open]').count() == 0
    # Invalid remote URLs cannot become local registrations.
    jan = page.locator('.tool-card').filter(has=page.get_by_role('heading', name='Jan', exact=True))
    await jan.get_by_role('button', name='Details', exact=True).click()
    await page.get_by_role('textbox', name='Local application URL').fill('https://example.com')
    await page.get_by_role('button', name='Save URL', exact=True).click()
    assert 'local' in (await page.locator('.toast').inner_text()).lower()
    await page.get_by_role('textbox', name='Local application URL').fill('http://localhost:3000')
    await page.get_by_role('button', name='Save URL', exact=True).click()
    await page.get_by_role('button', name='Run registered target', exact=True).wait_for()
    await page.keyboard.press('Escape')
    await page.get_by_role('button', name='Settings', exact=True).click()
    await page.get_by_role('checkbox', name='Check package releases on startup').uncheck()
    assert '20 general packages' in await page.get_by_role('dialog').inner_text()
    await page.get_by_role('button', name='Save settings', exact=True).click()
    await page.reload()
    await page.locator('.tool-card').first.wait_for()
    jan = page.locator('.tool-card').filter(has=page.get_by_role('heading', name='Jan', exact=True))
    assert await jan.get_by_role('button', name='Run now', exact=True).is_visible()
    await page.get_by_role('button', name='Settings', exact=True).click()
    assert not await page.get_by_role('checkbox', name='Check package releases on startup').is_checked()
    await page.keyboard.press('Escape')
    await jan.get_by_role('button', name='Details', exact=True).click()
    await page.get_by_role('button', name='Clear registration', exact=True).click()
    await page.keyboard.press('Escape')
    await page.get_by_role('button', name='Packages & updates', exact=True).click()
    assert await page.locator('.payload-row').count() == 20
    await page.get_by_role('button', name='Hardware packages', exact=True).click()
    assert await page.locator('.payload-row').count() == 8
    await page.keyboard.press('Escape')
    result = {'native': native, 'cards': 53, 'filters': 10, 'videoCards': 6,
              'creativeSuiteCards': 14, 'guidesRendered': len(titles), 'generalPackages': 20,
              'hardwareChoices': 8, 'registrationPersistence': True, 'settingsPersistence': True,
              'escapeAndDialogLabels': True, 'rendererErrors': errors}
    if native:
        result['unapprovedLink'] = await page.evaluate("window.hubx.openOfficial('https://evil.test/')")
        result['unregisteredLaunch'] = await page.evaluate("window.hubx.launch('jan')")
        result['unknownTool'] = await page.evaluate("window.hubx.setUrl('unknown-tool','http://localhost:3000')")
        result['invalidPackage'] = await page.evaluate("window.hubx.check(['unknown-package'])")
        assert all(result[key]['ok'] is False for key in ['unapprovedLink', 'unregisteredLaunch', 'unknownTool', 'invalidPackage'])
    else:
        await page.set_viewport_size({'width': 390, 'height': 844})
        assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        await page.screenshot(path=str(OUT / 'phase1-browser-mobile.png'))
        await jan.get_by_role('button', name='Details', exact=True).click()
        assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert await page.get_by_role('button', name='Close dialog', exact=True).is_visible()
        await page.screenshot(path=str(OUT / 'phase1-browser-mobile-guide.png'))
        await page.keyboard.press('Escape')
        result['mobile390NoOverflow'] = True
    assert not errors, errors
    (OUT / f'phase1-{name}-ui.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result, indent=2))


async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
        page = await browser.new_page(viewport={'width': 1440, 'height': 920})
        await page.goto('http://localhost:4200')
        await verify(page, False)
        await browser.close()
        electron = await playwright.chromium.connect_over_cdp('http://localhost:9241')
        await verify(electron.contexts[0].pages[0], True)
        await electron.close()


asyncio.run(main())