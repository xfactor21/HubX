import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { Offer } from '../../../hubx-core/releases';
import type { Progress } from '../../../hubx-core/contracts';

export async function streamDownload(offer: Offer, root: string, signal: AbortSignal, progress: (p: Progress)=>void, fetcher: typeof fetch = fetch) {
  if (!offer.url || !offer.name || !offer.bytes) throw new Error('Check the official release before downloading.');
  if (!/^[a-zA-Z0-9._-]+$/.test(offer.name)) throw new Error('Unsafe asset filename.');
  const folder=path.join(root,offer.id,offer.version!.replace(/[^a-zA-Z0-9._-]/g,'_'));
  await fs.mkdir(folder,{recursive:true});
  const target=path.join(folder,offer.name);
  const part=`${target}.${crypto.randomUUID()}.part`;
  let received=0, last=0;
  const hash=crypto.createHash('sha256');
  try {
    const response=await fetcher(offer.url,{signal:AbortSignal.any([signal,AbortSignal.timeout(2*60*60*1000)]),redirect:'follow',headers:{'User-Agent':'HubX/3.1.1'}});
    const final=new URL(response.url);
    if (final.protocol!=='https:' || !['github.com','release-assets.githubusercontent.com','objects.githubusercontent.com'].includes(final.hostname)) throw new Error('Download redirected outside approved GitHub asset hosts.');
    if (!response.ok || !response.body) throw new Error(`Download failed (${response.status}).`);
    const mime=response.headers.get('content-type') || '';
    if (/text\/html|application\/json/.test(mime)) throw new Error('The server returned a page instead of a package.');
    const counter=new Transform({transform(chunk,_enc,callback) {
      received+=chunk.length; hash.update(chunk);
      if(received>offer.bytes!) return callback(new Error('Download exceeds the official asset size.'));
      if(Date.now()-last>200) { last=Date.now();progress({id:offer.id,received,total:offer.bytes!,status:'Downloading'}); }
      callback(null,chunk);
    }});
    await pipeline(Readable.fromWeb(response.body as never),counter,createWriteStream(part,{flags:'wx'}),{signal});
    if(received!==offer.bytes) throw new Error('Download size did not match the official release.');
    const digest=hash.digest('hex');
    if(offer.digest && digest.toLowerCase()!==offer.digest.toLowerCase()) throw new Error('SHA-256 mismatch; the untrusted download was removed.');
    // Keep any previous valid asset intact until the new one passes validation.
    const backup=`${target}.backup-${crypto.randomUUID()}`;
    let backed=false;
    try { await fs.rename(target,backup); backed=true; } catch(e) { if((e as NodeJS.ErrnoException).code!=='ENOENT') throw e; }
    try { await fs.rename(part,target); } catch(e) { if(backed) await fs.rename(backup,target); throw e; }
    if(backed) await fs.rm(backup,{force:true});
    progress({id:offer.id,received,total:received,status:offer.digest?'SHA-256 verified':'Size verified; publisher checksum unavailable'});
    return {target,digest};
  } finally { await fs.rm(part,{force:true}); }
}