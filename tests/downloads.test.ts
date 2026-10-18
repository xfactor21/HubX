import {test,expect} from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {streamDownload} from '../packages/desktop/electron/downloads';
const bytes=Buffer.from('verified package bytes');
const offer={id:'jan',label:'Jan',version:'v1',name:'Jan.exe',bytes:bytes.length,url:'https://github.com/janhq/jan/releases/download/v1/Jan.exe',digest:crypto.createHash('sha256').update(bytes).digest('hex')};
function fake(body:Buffer,url='https://release-assets.githubusercontent.com/asset'){return (async()=>{const r=new Response(body);Object.defineProperty(r,'url',{value:url});return r;}) as unknown as typeof fetch;}
async function withDir(fn:(p:string)=>Promise<void>){const p=await fs.mkdtemp(path.join(os.tmpdir(),'hubx-dl-'));try{await fn(p);}finally{await fs.rm(p,{recursive:true,force:true});}}
test('streams bytes and verifies published SHA-256',()=>withDir(async p=>{const r=await streamDownload(offer,p,new AbortController().signal,()=>{},fake(bytes));expect(await fs.readFile(r.target)).toEqual(bytes);expect(r.digest).toBe(offer.digest);}));
test('checksum mismatch preserves prior valid package and cleans partials',()=>withDir(async p=>{const dir=path.join(p,'jan','v1');await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,'Jan.exe'),'prior');await expect(streamDownload({...offer,digest:'0'.repeat(64)},p,new AbortController().signal,()=>{},fake(bytes))).rejects.toThrow('SHA-256 mismatch');expect(await fs.readFile(path.join(dir,'Jan.exe'),'utf8')).toBe('prior');expect((await fs.readdir(dir)).some(n=>n.endsWith('.part'))).toBe(false);}));
test('wrong size rejected and partial cleaned',()=>withDir(async p=>{await expect(streamDownload({...offer,bytes:100},p,new AbortController().signal,()=>{},fake(bytes))).rejects.toThrow('size');expect(await fs.readdir(path.join(p,'jan','v1'))).toHaveLength(0);}));
test('unapproved redirect rejected',()=>withDir(async p=>{await expect(streamDownload(offer,p,new AbortController().signal,()=>{},fake(bytes,'https://evil.test/asset'))).rejects.toThrow('redirected');}));
test('cancellation cleans temporary file',()=>withDir(async p=>{const c=new AbortController();c.abort();await expect(streamDownload(offer,p,c.signal,()=>{},fake(bytes))).rejects.toThrow();expect(await fs.readdir(path.join(p,'jan','v1'))).toHaveLength(0);}));
test('no digest does not pretend checksum verified',()=>withDir(async p=>{const logs:string[]=[];await streamDownload({...offer,digest:undefined},p,new AbortController().signal,o=>logs.push(o.status),fake(bytes));expect(logs.at(-1)).toContain('publisher checksum unavailable');}));
