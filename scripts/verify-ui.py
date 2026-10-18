import asyncio, json, sys
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    root=Path(__file__).resolve().parent.parent
    out=root/'verification';out.mkdir(exist_ok=True)
    async with async_playwright() as p:
        browser=await p.chromium.connect_over_cdp(sys.argv[1] if len(sys.argv)>1 else 'http://localhost:9240')
        page=browser.contexts[0].pages[0]
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        await page.locator('.tool-card').first.wait_for()
        assert await page.locator('.tool-card').count()==32
        assert await page.locator('.filter').count()==9
        if await page.locator('dialog[open]').count():
            if await page.get_by_role('button',name='Open dashboard',exact=True).count():
                await page.get_by_role('button',name='Open dashboard',exact=True).click()
            else:
                await page.get_by_role('button',name='Close dialog',exact=True).click()
        await page.screenshot(path=str(out/'desktop-dashboard.png'),full_page=False)
        await page.get_by_role('searchbox',name='Search projects').fill('whisper')
        assert await page.locator('.tool-card').count()==2
        await page.get_by_role('searchbox',name='Search projects').fill('')
        await page.get_by_role('button',name='Video',exact=True).click()
        assert await page.locator('.tool-card').count()==4
        await page.get_by_role('button',name='All',exact=True).click()
        card=page.locator('.tool-card').filter(has=page.get_by_role('heading',name='Jan',exact=True))
        await card.get_by_role('button',name='Details',exact=True).click()
        await page.get_by_role('textbox',name='Local application URL').fill('https://example.com')
        await page.get_by_role('button',name='Save URL',exact=True).click()
        assert 'local' in (await page.locator('.toast').inner_text()).lower()
        await page.get_by_role('textbox',name='Local application URL').fill('http://localhost:3000')
        await page.get_by_role('button',name='Save URL',exact=True).click()
        await page.get_by_role('button',name='Run registered target',exact=True).wait_for()
        await page.get_by_role('button',name='Clear registration',exact=True).click()
        await page.get_by_role('button',name='Close dialog',exact=True).click()
        await page.get_by_role('button',name='Settings',exact=True).click()
        await page.get_by_role('checkbox',name='Check package releases on startup').uncheck()
        await page.get_by_role('button',name='Save settings',exact=True).click()
        await page.get_by_role('button',name='Choose hardware packages ↗',exact=True).click()
        assert await page.locator('.payload-row').count()==7
        await page.get_by_role('button',name='Close dialog',exact=True).click()
        native=await page.evaluate('!!window.hubx')
        result={'native':native,'cards':32,'categories':9,'searchWhisper':2,'videoCards':4,'hardwareChoices':7,'registrationRoundTrip':True,'settingsSaved':True,'rendererErrors':errors}
        if native:
            checks=await page.evaluate('''async()=>{const a=await window.hubx.check(['anythingllm','jan','krita-ai-diffusion','cline']);return a;}''')
            result['releaseChecks']=checks
            assert all(o.get('name') and not o.get('error') for o in checks),checks
            result['unapprovedLink']=await page.evaluate("window.hubx.openOfficial('https://evil.test/')")
            assert result['unapprovedLink']['ok']==False
            result['unregisteredLaunch']=await page.evaluate("window.hubx.launch('jan')")
            assert result['unregisteredLaunch']['ok']==False
            await page.get_by_role('button',name='Packages & updates',exact=True).click()
            await page.get_by_role('button',name='Check listed releases',exact=True).click()
            await page.get_by_role('button',name='Download',exact=True).first.wait_for(timeout=120000)
            await page.screenshot(path=str(out/'desktop-package-releases.png'))
        assert not errors,errors
        (out/('native-ui.json' if native else 'browser-ui.json')).write_text(json.dumps(result,indent=2))
        print(json.dumps(result,indent=2))
        await browser.close()

asyncio.run(main())
