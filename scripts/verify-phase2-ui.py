"""Phase 2 real native scan + isolated synthetic Windows UI fixtures."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'verification'
GIB = 1024 ** 3


async def ready(page):
    await page.locator('.tool-card').first.wait_for()
    if await page.get_by_role('button', name='Open dashboard', exact=True).count():
        await page.get_by_role('button', name='Open dashboard', exact=True).click()
    assert await page.locator('.tool-card').count() == 53


async def consent_scan(page):
    await page.get_by_role('button', name='Scan my hardware', exact=True).click()
    run = page.get_by_role('button', name='Run local scan', exact=True)
    assert not await run.is_enabled()
    await page.get_by_role('checkbox', name='I consent to a local, read-only hardware scan', exact=True).check()
    assert await run.is_enabled()
    await run.click()


def fixture(gpu=None, **extra):
    value = {'scannedAt': '2026-10-23T12:00:00Z', 'platform': 'win32', 'osName': 'Windows 11',
             'osVersion': '10.0.26100', 'arch': 'x64', 'cpu': 'Synthetic fixture CPU', 'logicalCores': 16,
             'ramBytes': 32 * GIB, 'diskFreeBytes': 100 * GIB, 'diskScope': 'HubX data volume',
             'gpus': [gpu or {'name': 'NVIDIA GeForce RTX 4090', 'vendor': 'NVIDIA', 'vramBytes': 24 * GIB,
                             'driver': '581.80', 'driverSource': 'nvidia-smi', 'computeCapability': 8.9}],
             'gpuDetection': 'complete', 'warnings': []}
    value.update(extra)
    return value


async def mock_context(browser, report, version='v0.42.1', failed=False):
    context = await browser.new_context(viewport={'width': 1440, 'height': 1000})
    args = json.dumps({'report': report, 'version': version, 'failed': failed})
    await context.add_init_script('''(() => {const value = ''' + args + ''';
      window.__phase2Test = {scans:0,checks:0,downloads:0};
      window.hubx = {
        getState:async()=>({settings:{automaticChecks:false},registrations:{},downloads:{},welcomed:true}),
        scanHardware:async(consent)=>{window.__phase2Test.scans++;return value.failed?{ok:false,message:'Synthetic scan failure; use manual verification.'}:{ok:consent===true,report:value.report};},
        check:async(ids)=>{window.__phase2Test.checks++;return ids.map(id=>({id,label:id,version:value.version,name:'ComfyUI_windows_portable_nvidia.7z',bytes:2048,url:'https://github.com/Comfy-Org/ComfyUI/releases/download/'+value.version+'/ComfyUI_windows_portable_nvidia.7z'}));},
        download:async()=>{window.__phase2Test.downloads++;return {ok:true,message:'Fixture only; no file downloaded.'};},
        onProgress:()=>()=>{},welcome:async()=>({ok:true}),openOfficial:async()=>({ok:true})
      };
    })();''')
    return context


async def verify_browser(browser):
    page = await browser.new_page(viewport={'width': 1440, 'height': 1000})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    await page.goto('http://localhost:4200')
    await ready(page)
    assert not await page.get_by_role('button', name='Scan my hardware', exact=True).is_enabled()
    assert await page.locator('.hardware-unavailable').is_visible()
    assert await page.locator('.hardware-results').count() == 0
    await page.get_by_role('button', name='Choose packages manually', exact=True).click()
    assert await page.locator('.payload-row').count() == 9
    await page.keyboard.press('Escape')
    await page.get_by_role('searchbox', name='Search projects').fill('whisper')
    assert await page.locator('.tool-card').count() == 2
    await page.get_by_role('searchbox', name='Search projects').fill('')
    await page.get_by_role('button', name='Creative suite', exact=True).click()
    assert await page.locator('.tool-card').count() == 14
    await page.get_by_role('button', name='All', exact=True).click()
    # All guides still render after main-screen hardware changes.
    titles = await page.locator('.tool-card h2').all_text_contents()
    for title in titles:
        card = page.locator('.tool-card').filter(has=page.get_by_role('heading', name=title, exact=True))
        await card.get_by_role('button', name='Details', exact=True).click()
        assert await page.locator('.catalog-guide ol li').count() >= 3
        if title == 'ComfyUI':
            assert 'v0.42.1' in await page.get_by_role('dialog').inner_text()
            assert '2026-10-23' in await page.get_by_role('dialog').inner_text()
        await page.keyboard.press('Escape')
    await page.screenshot(path=str(OUT / 'phase2-browser-dashboard.png'))
    await page.set_viewport_size({'width': 390, 'height': 844})
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    await page.locator('.hardware-panel').screenshot(path=str(OUT / 'phase2-browser-mobile-panel.png'))
    await page.get_by_role('button', name='Choose packages manually', exact=True).click()
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    await page.keyboard.press('Escape')
    assert not errors, errors
    return {'cards': 53, 'guidesRendered': len(titles), 'browserScanUnavailable': True,
            'manualHardwareChoices': 9, 'creativeSuite': 14, 'mobile390NoOverflow': True, 'rendererErrors': errors}


async def verify_fixtures(browser):
    results = {}
    cases = {'modern': fixture(), 'legacy': fixture({'name': 'NVIDIA GeForce GTX 1080', 'vendor': 'NVIDIA', 'vramBytes': 8 * GIB, 'driver': '560.76', 'driverSource': 'nvidia-smi', 'computeCapability': 6.1}),
             'arm64': fixture(arch='arm64'), 'unknown-driver': fixture({'name': 'NVIDIA GeForce RTX 4090', 'vendor': 'NVIDIA', 'vramBytes': 24 * GIB, 'driver': None, 'driverSource': 'unknown', 'computeCapability': 8.9})}
    for name, report in cases.items():
        context = await mock_context(browser, report)
        page = await context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto('http://localhost:4200')
        await ready(page)
        assert await page.evaluate('window.__phase2Test.scans') == 0
        await page.get_by_role('button', name='Scan my hardware', exact=True).click()
        await page.get_by_role('button', name='Not now', exact=True).click()
        assert await page.evaluate('window.__phase2Test.scans') == 0
        await consent_scan(page)
        await page.get_by_role('heading', name='Local scan results', exact=True).wait_for()
        assert await page.locator('.hardware-source-links button').count() == 6
        assert await page.evaluate('window.__phase2Test.scans') == 1
        assert await page.evaluate('window.__phase2Test.checks') == 0
        assert await page.evaluate('window.__phase2Test.downloads') == 0
        if name == 'unknown-driver':
            assert await page.locator('.hardware-advice.manual').count() == 1
            assert await page.get_by_role('button', name='Review candidate package', exact=True).count() == 0
        else:
            assert await page.locator('.hardware-advice.candidate').count() == 1
            if name == 'modern':
                await page.locator('.hardware-panel').screenshot(path=str(OUT / 'phase2-fixture-modern-candidate.png'))
            await page.get_by_role('button', name='Review candidate package', exact=True).click()
            assert await page.locator('.payload-row').count() == 1
            await page.get_by_role('button', name='Download', exact=True).wait_for()
            assert await page.evaluate('window.__phase2Test.downloads') == 0
            # Cancel confirmation: no download call. Accept: exactly one fixture call.
            page.once('dialog', lambda dialog: dialog.dismiss())
            await page.get_by_role('button', name='Download', exact=True).click()
            assert await page.evaluate('window.__phase2Test.downloads') == 0
            page.once('dialog', lambda dialog: dialog.accept())
            await page.get_by_role('button', name='Download', exact=True).click()
            assert await page.evaluate('window.__phase2Test.downloads') == 1
            await page.keyboard.press('Escape')
            await page.get_by_role('button', name='Dismiss', exact=True).click()
            await page.get_by_role('button', name='Dismiss message', exact=True).click()
        await page.set_viewport_size({'width': 390, 'height': 844})
        assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        if name == 'modern':
            await page.locator('.hardware-advice').screenshot(path=str(OUT / 'phase2-fixture-mobile-advice.png'))
        await page.get_by_role('button', name='Forget scan results', exact=True).click()
        assert await page.locator('.hardware-results').count() == 0
        assert not errors, errors
        results[name] = {'consentGate': True, 'noAutomaticCheckOrDownload': True, 'forgetResults': True, 'rendererErrors': errors}
        await context.close()
    context = await mock_context(browser, fixture(), failed=True)
    page = await context.new_page()
    await page.goto('http://localhost:4200')
    await ready(page)
    await consent_scan(page)
    await page.get_by_role('alert').wait_for()
    assert await page.locator('.hardware-results').count() == 0
    results['failed-scan'] = {'visibleError': True, 'noFabricatedReport': True}
    await context.close()
    context = await mock_context(browser, fixture(), version='v9.0.0')
    page = await context.new_page()
    await page.goto('http://localhost:4200')
    await ready(page)
    await consent_scan(page)
    await page.get_by_role('button', name='Review candidate package', exact=True).click()
    await page.get_by_role('button', name='Download', exact=True).wait_for()
    messages = []
    async def dismiss_unreviewed(dialog):
        messages.append(dialog.message)
        await dialog.dismiss()
    page.once('dialog', dismiss_unreviewed)
    await page.get_by_role('button', name='Download', exact=True).click()
    assert 'has not been reviewed' in messages[0]
    assert await page.evaluate('window.__phase2Test.downloads') == 0
    results['unreviewed-release'] = {'manualVerificationWarning': True, 'cancelledNoDownload': True}
    await context.close()
    return results


async def verify_native(playwright):
    electron = await playwright.chromium.connect_over_cdp('http://localhost:9242')
    page = electron.contexts[0].pages[0]
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    await page.reload()
    await ready(page)
    rejected = await page.evaluate('window.hubx.scanHardware(false)')
    assert rejected['ok'] is False and 'consent' in rejected['message']
    assert await page.locator('.hardware-results').count() == 0
    requests = []
    page.on('request', lambda request: requests.append({'url': request.url, 'body': request.post_data or ''}))
    await consent_scan(page)
    await page.get_by_role('heading', name='Local scan results', exact=True).wait_for(timeout=30000)
    assert await page.locator('.hardware-advice.manual').count() == 1
    assert await page.locator('.hardware-source-links button').count() == 6
    assert 'Windows packages' in await page.locator('.hardware-advice').inner_text()
    assert await page.get_by_role('button', name='Review candidate package', exact=True).count() == 0
    await page.locator('.hardware-panel').screenshot(path=str(OUT / 'phase2-native-local-scan.png'))
    assert not any('api.github.com' in r['url'] or 'computeCapability' in r['body'] or 'ramBytes' in r['body'] or 'diskFreeBytes' in r['body'] for r in requests), requests
    await page.get_by_role('button', name='Forget scan results', exact=True).click()
    assert await page.locator('.hardware-results').count() == 0
    await page.reload()
    await ready(page)
    assert await page.locator('.hardware-results').count() == 0
    await page.get_by_role('button', name='Choose packages manually', exact=True).click()
    assert await page.locator('.payload-row').count() == 9
    await page.keyboard.press('Escape')
    assert not errors, errors
    state = await page.evaluate('window.hubx.getState()')
    assert 'hardware' not in state and 'report' not in state
    result = {'native': True, 'realPlatform': 'linux', 'consentFalseRejected': True, 'realScanPartialFallback': True,
              'officialEvidenceLinks': 6,
              'noReleaseCheckOrHardwareUploadDuringScan': True, 'noScanInPersistedState': True,
              'forgetAndReloadClear': True, 'manualHardwareChoices': 9, 'rendererErrors': errors}
    await electron.close()
    return result


async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
        result = {'browser': await verify_browser(browser), 'syntheticWindowsFixtures': await verify_fixtures(browser), 'native': await verify_native(playwright)}
        await browser.close()
        (OUT / 'phase2-ui.json').write_text(json.dumps(result, indent=2) + '\n')
        print(json.dumps(result, indent=2))


asyncio.run(main())