import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { defaultState, type LocalState } from '../../../hubx-core/contracts';
import { tools } from '../../../hubx-core/catalog';
import { validLocalUrl } from '../../../hubx-core/releases';

export async function atomicJson(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file),{recursive:true});
  const temp = `${file}.${crypto.randomUUID()}.tmp`;
  try { await fs.writeFile(temp,JSON.stringify(data,null,2),{mode:0o600}); await fs.rename(temp,file); }
  finally { await fs.rm(temp,{force:true}); }
}
export class Store {
  state = defaultState();
  private queue = Promise.resolve();
  constructor(public root: string) {}
  get file() { return path.join(this.root,'hubx-state.json'); }
  async load() {
    try {
      const raw=JSON.parse(await fs.readFile(this.file,'utf8'));
      this.state.settings.automaticChecks=raw.settings?.automaticChecks===true;
      this.state.welcomed=raw.welcomed===true;
      this.state.downloads=raw.downloads && typeof raw.downloads==='object' ? raw.downloads : {};
      this.importRegistrations(raw.registrations);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') await fs.copyFile(this.file,`${this.file}.corrupt-${Date.now()}`).catch(()=>{});
      // Legacy registrations are retained; obsolete setup/indexing settings are not migrated.
      try { this.importRegistrations(JSON.parse(await fs.readFile(path.join(this.root,'tool-registrations.json'),'utf8'))); } catch {}
    }
    return this.state;
  }
  private importRegistrations(raw: unknown) {
    if (!raw || typeof raw!=='object') return;
    for (const [id,value] of Object.entries(raw)) {
      const r=value as {kind?:string;target?:string};
      if (!tools.some(t=>t.id===id) || typeof r?.target!=='string') continue;
      if (r.kind==='file' && path.isAbsolute(r.target)) this.state.registrations[id]={kind:'file',target:r.target};
      else if (r.kind==='url' && validLocalUrl(r.target)) this.state.registrations[id]={kind:'url',target:r.target};
    }
  }
  async update(fn: (state: LocalState)=>void) {
    const task=this.queue.then(async()=> { const next=structuredClone(this.state); fn(next); await atomicJson(this.file,next); this.state=next; });
    this.queue=task.catch(()=>{});
    await task;
    return structuredClone(this.state);
  }
}