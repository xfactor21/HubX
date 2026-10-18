import fs from 'node:fs/promises';
import path from 'node:path';
const platform=process.argv[2];
if(!['win','linux'].includes(platform!))throw new Error('Use win or linux.');
const root=path.resolve(import.meta.dir,'..');
async function run(args:string[],cwd=root){const proc=Bun.spawn(args,{cwd,stdout:'inherit',stderr:'inherit'});if(await proc.exited)throw new Error(`Failed: ${args.join(' ')}`);}
await run(['bun','run','build']);
const source=path.join(root,'packages/web/dist');
await fs.access(path.join(source,'index.html'));
const target=path.join(root,'packages/desktop/web-dist');
await fs.rm(target,{recursive:true,force:true});await fs.cp(source,target,{recursive:true});
const htmlPath=path.join(target,'index.html');
const html=await fs.readFile(htmlPath,'utf8');
await fs.writeFile(htmlPath,html.replace('<head>',`<head><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; object-src 'none'; base-uri 'none'">`));
// Vite's relative asset base supports offline file:// in packaged Electron.
await run(['bunx','electron-builder',`--${platform}`, '--publish','never'],path.join(root,'packages/desktop'));
