import fs from 'node:fs/promises';
import { tools } from '../hubx-core/catalog';
import { sources, resolveSource } from '../hubx-core/releases';
const urls=[...new Set([...tools.flatMap(t=>[t.sourceUrl,t.setupUrl,...t.downloads.map(d=>d.url)]),...sources.map(s=>`https://github.com/${s.repo}/releases`)])];
const results:{url:string;status:number;error?:string}[]=[];
for(let i=0;i<urls.length;i+=8)await Promise.all(urls.slice(i,i+8).map(async url=>{try{const r=await fetch(url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(30000)});results.push({url,status:r.status});}catch(e){results.push({url,status:0,error:(e as Error).message});}}));
const releases=[];
for(const source of sources){try{releases.push(await resolveSource(source));}catch(e){releases.push({id:source.id,error:(e as Error).message});}}
await fs.mkdir('verification',{recursive:true});await fs.writeFile('verification/live-links.json',JSON.stringify({checkedAt:new Date().toISOString(),urls:results,releases},null,2));
console.log(`${results.filter(r=>r.status>=200 && r.status<400).length}/${results.length} URLs resolve; ${releases.filter(r=>!('error' in r)).length}/${sources.length} package assets selected.`);
if(results.some(r=>r.status<200 || r.status>=400) || releases.some(r=>'error' in r))process.exitCode=1;
