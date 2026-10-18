import {test,expect} from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {Store,atomicJson} from '../packages/desktop/electron/store';
async function withDir(fn:(p:string)=>Promise<void>){const p=await fs.mkdtemp(path.join(os.tmpdir(),'hubx-test-'));try{await fn(p);}finally{await fs.rm(p,{recursive:true,force:true});}}
test('legacy registrations migrate safely',()=>withDir(async p=>{await atomicJson(path.join(p,'tool-registrations.json'),{jan:{kind:'url',target:'http://localhost:3000'},cline:{kind:'url',target:'https://evil.test'},unknown:{kind:'file',target:'/tmp/x'}});const s=new Store(p);await s.load();expect(Object.keys(s.state.registrations)).toEqual(['jan']);}));
test('atomic settings round-trip',()=>withDir(async p=>{const s=new Store(p);await s.load();await s.update(st=>{st.settings.automaticChecks=true;st.welcomed=true;});const again=new Store(p);await again.load();expect(again.state.settings.automaticChecks).toBe(true);expect(again.state.welcomed).toBe(true);expect((await fs.readdir(p)).filter(n=>n.endsWith('.tmp'))).toHaveLength(0);}));
test('concurrent writes serialize without lost updates',()=>withDir(async p=>{const s=new Store(p);await s.load();await Promise.all([s.update(st=>{st.welcomed=true;}),s.update(st=>{st.settings.automaticChecks=true;})]);expect(s.state.welcomed).toBe(true);expect(s.state.settings.automaticChecks).toBe(true);}));
test('corrupt settings are preserved for recovery',()=>withDir(async p=>{await fs.writeFile(path.join(p,'hubx-state.json'),'broken');const s=new Store(p);await s.load();expect(s.state.registrations).toEqual({});expect((await fs.readdir(p)).some(n=>n.includes('.corrupt-'))).toBe(true);}));
