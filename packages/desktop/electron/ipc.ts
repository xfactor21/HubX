import { app, ipcMain, dialog, shell, type BrowserWindow } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createReadStream } from 'node:fs';
import { Store } from './store';
import { streamDownload } from './downloads';
import { tools } from '../../../hubx-core/catalog';
import { sources, resolveSource, validLocalUrl, type Offer } from '../../../hubx-core/releases';
import { hardwareEvidence } from '../../../hubx-core/hardware';
import { scanHardware } from './hardware';

export async function registerIpcHandlers(getWindow:()=>BrowserWindow|null) {
  const root=process.env.HUBX_TEST_DATA || path.join(app.getPath('appData'),'Open Source Hub');
  const store=new Store(root); await store.load();
  const offers=new Map<string,Offer>();
  const active=new Map<string,AbortController>();
  let scanning=false;
  const downloadedPath=(o:Offer)=>path.join(root,'managed-downloads',o.id,o.version!.replace(/[^a-zA-Z0-9._-]/g,'_'),o.name!);
  const handle=(channel:string,fn:(...args:any[])=>any)=>ipcMain.handle(channel,async(event,...args)=>{
    if(event.sender!==getWindow()?.webContents || event.senderFrame!==event.sender.mainFrame) throw new Error('Untrusted IPC sender.');
    try{return await fn(...args);}catch(e){return {ok:false,message:(e as Error).message || 'Operation failed.'};}
  });
  handle('window:minimize',()=>getWindow()?.minimize());
  handle('window:maximize',()=>{const win=getWindow();if(win?.isMaximized())win.unmaximize();else win?.maximize();});
  handle('window:close',()=>getWindow()?.close());
  const tool=(id:string)=>{ if(!tools.some(t=>t.id===id)) throw new Error('Unknown catalog tool.'); };
  handle('hub:state',()=>structuredClone(store.state));
  handle('hub:hardware',async(consent:unknown)=>{
    if(consent!==true) throw new Error('Explicit local hardware scan consent is required.');
    if(scanning) throw new Error('A local hardware scan is already running.');
    scanning=true;
    try {return {ok:true,report:await scanHardware(root)};} finally {scanning=false;}
  });
  handle('hub:settings',async(s:unknown)=>({ok:true,state:await store.update(st=>{st.settings={automaticChecks:(s as any)?.automaticChecks===true};})}));
  handle('hub:welcome',async()=>({ok:true,state:await store.update(s=>{s.welcomed=true;})}));
  handle('hub:url',async(id:string,url:string)=>{
    tool(id); if(!validLocalUrl(url)) throw new Error('Use a local HTTP(S) URL: localhost, loopback, or a private LAN address.');
    return {ok:true,state:await store.update(s=>{s.registrations[id]={kind:'url',target:url};})};
  });
  handle('hub:file',async(id:string)=>{
    tool(id);const win=getWindow()!;
    const result=await dialog.showOpenDialog(win,{title:`Register ${id}`,properties:['openFile'],filters:[{name:'Launch target',extensions:['exe','bat','cmd','ps1','py','js','jar','sh','AppImage']},{name:'All files',extensions:['*']}]});
    if(result.canceled || !result.filePaths[0]) return {ok:false,cancelled:true};
    return {ok:true,state:await store.update(s=>{s.registrations[id]={kind:'file',target:result.filePaths[0]!};})};
  });
  handle('hub:clear',async(id:string)=>{tool(id);return {ok:true,state:await store.update(s=>{delete s.registrations[id];})};});
  handle('hub:launch',async(id:string)=>{
    tool(id);const r=store.state.registrations[id];if(!r) throw new Error('Register a local target first.');
    if(r.kind==='url') { if(!validLocalUrl(r.target)) throw new Error('Registered URL is no longer valid.');await shell.openExternal(r.target); }
    else {const stat=await fs.stat(r.target).catch(()=>null);if(!stat?.isFile()) throw new Error('The registered file no longer exists. Register it again.');const error=await shell.openPath(r.target);if(error)throw new Error(error);}
    return {ok:true,message:'Launch request sent to the operating system. Script targets may require a configured file association.'};
  });
  handle('hub:official',async(url:string)=>{
    // Exact catalog/release-page allowlist, not an arbitrary HTTP(S) escape hatch.
    const allowed=new Set([...tools.flatMap(t=>[t.sourceUrl,t.setupUrl,...t.downloads.map(d=>d.url)]),...sources.map(s=>`https://github.com/${s.repo}/releases`),...hardwareEvidence.map(s=>s.url)]);
    if(!allowed.has(url)) throw new Error('Not an approved official project link.');
    await shell.openExternal(url);return {ok:true};
  });
  handle('hub:check',async(ids:unknown)=>{
    if(!Array.isArray(ids) || ids.length>sources.length || ids.some(id=>!sources.some(s=>s.id===id))) throw new Error('Invalid package selection.');
    const results:Offer[]=[];
    for(const id of new Set(ids)) {
      const source=sources.find(s=>s.id===id)!;
      try {
        const offer=await resolveSource(source);offers.set(id,offer);
        const stored=store.state.downloads[id];
        offer.downloaded=stored?.name===offer.name && stored?.version===offer.version && !!await fs.stat(downloadedPath(offer)).catch(()=>null);
        results.push({...offer});
      } catch(e) {offers.delete(id);results.push({id,label:source.label,error:(e as Error).message});}
    }
    return results;
  });
  handle('hub:download',async(id:string)=>{
    if(active.size) throw new Error('One download is already running. Cancel it or wait.');
    const offer=offers.get(id);if(!offer || offer.error) throw new Error('Check this package before downloading.');
    const abort=new AbortController();active.set(id,abort);
    try {
      await streamDownload(offer,path.join(root,'managed-downloads'),abort.signal,p=>getWindow()?.webContents.send('hub:progress',p));
      return {ok:true,message:offer.digest?'Downloaded and SHA-256 verified. Installation remains your choice.':'Downloaded; size verified. No publisher checksum was available. Verify the publisher before opening.',state:await store.update(s=>{s.downloads[id]={...offer,downloaded:true};})};
    } catch(e) {
      getWindow()?.webContents.send('hub:progress',{id,received:0,total:0,status:abort.signal.aborted?'Cancelled':'Failed'});
      throw new Error(abort.signal.aborted?'Download cancelled. No partial package was kept.':(e as Error).message);
    } finally {active.delete(id);}
  });
  handle('hub:cancel',(id:string)=>{active.get(id)?.abort();return {ok:true};});
  handle('hub:open-download',async(id:string)=>{
    const stored=store.state.downloads[id];if(!sources.some(s=>s.id===id) || stored?.id!==id || !stored?.name || !stored.version || !/^[a-zA-Z0-9._-]+$/.test(stored.name)) throw new Error('No downloaded package.');
    const file=downloadedPath(stored);const stat=await fs.stat(file).catch(()=>null);
    if(!stat?.isFile() || stat.size!==stored.bytes) throw new Error('Downloaded package is missing or changed. Download it again.');
    if(stored.digest) {const hash=crypto.createHash('sha256');for await(const chunk of createReadStream(file))hash.update(chunk);if(hash.digest('hex').toLowerCase()!==stored.digest.toLowerCase())throw new Error('Downloaded file checksum changed. Download it again.');}
    // Opening may execute a vendor installer; this handler is only invoked by explicit user action.
    const error=await shell.openPath(file);if(error)throw new Error(error);return {ok:true,message:'Package opened. Follow the vendor setup instructions.'};
  });
  app.on('before-quit',()=>{for(const c of active.values())c.abort();});
}
