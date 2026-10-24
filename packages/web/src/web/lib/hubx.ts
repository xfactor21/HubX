import { defaultState, type HubAPI } from '../../../../../hubx-core/contracts';
import { tools } from '../../../../../hubx-core/catalog';
import { sources, validLocalUrl } from '../../../../../hubx-core/releases';
import { hardwareEvidence } from '../../../../../hubx-core/hardware';
declare global { interface Window { hubx?: HubAPI } }
const key='hubx-browser-preview-v311';
function load(){try{return {...defaultState(),...JSON.parse(localStorage.getItem(key)||'{}')};}catch{return defaultState();}}
function mutate(fn:(s:ReturnType<typeof defaultState>)=>void){const s=load();fn(s);localStorage.setItem(key,JSON.stringify(s));return {ok:true,state:s};}
const unavailable=async()=>({ok:false,message:'This action requires the Windows desktop build. Browser preview cannot access local files or download packages.'});
const preview:HubAPI={
 getState:async()=>load(),saveSettings:async(settings)=>mutate(s=>{s.settings=settings;}),welcome:async()=>mutate(s=>{s.welcomed=true;}),
 scanHardware:async()=>({ok:false,message:'Hardware scanning is available only in the native desktop app. Browser preview cannot read your PC specifications.'}),
 setUrl:async(id,target)=>validLocalUrl(target)?mutate(s=>{s.registrations[id]={kind:'url',target};}):{ok:false,message:'Enter a local HTTP(S) URL.'},
 chooseFile:unavailable,clear:async(id)=>mutate(s=>{delete s.registrations[id];}),launch:unavailable,
 check:async(ids)=>ids.map(id=>({id,label:sources.find(s=>s.id===id)?.label||id,error:'Release checks run in the desktop app. Use the official release page in this browser preview.'})),
 download:unavailable,cancel:unavailable,openDownload:unavailable,
 openOfficial:async(url)=>{const allowed=tools.flatMap(t=>[t.sourceUrl,t.setupUrl,...t.downloads.map(d=>d.url)]).concat(sources.map(s=>`https://github.com/${s.repo}/releases`),hardwareEvidence.map(s=>s.url));if(!allowed.includes(url))return {ok:false,message:'Unapproved link.'};window.open(url,'_blank','noopener,noreferrer');return {ok:true};},onProgress:()=>()=>{},
};
export const hub=()=>window.hubx || preview;
