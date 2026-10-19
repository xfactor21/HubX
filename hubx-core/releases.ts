import { craftApps } from './additions';

export const VERSION = '3.1.1';
export interface PackageSource { id: string; toolId: string; label: string; repo: string; assetPattern: string; kind: string; hardware?: string; note: string }
export interface ReleaseAsset { name: string; size: number; browser_download_url: string; digest?: string | null }
export interface Release { tag_name: string; draft?: boolean; prerelease?: boolean; assets: ReleaseAsset[] }
export interface Offer { id: string; label: string; version?: string; name?: string; bytes?: number; url?: string; digest?: string; error?: string; downloaded?: boolean }
export const sources: PackageSource[] = [
  {id:'anythingllm',toolId:'anythingllm',label:'AnythingLLM',repo:'Mintplex-Labs/anything-llm',assetPattern:'^AnythingLLMDesktop\\.exe$',kind:'Windows installer',note:'Choose a model/provider after installing.'},
  {id:'jan',toolId:'jan',label:'Jan',repo:'janhq/jan',assetPattern:'^Jan_.*_x64-setup\\.exe$',kind:'Windows installer',note:'Models and hardware configuration are separate.'},
  {id:'krita-ai-diffusion',toolId:'krita-ai-diffusion',label:'Krita AI Diffusion',repo:'Acly/krita-ai-diffusion',assetPattern:'^krita_ai_diffusion-[0-9.]+\\.zip$',kind:'Krita plugin ZIP',note:'Requires Krita and a configured diffusion backend.'},
  {id:'cline',toolId:'cline',label:'Cline',repo:'cline/cline',assetPattern:'^(?:claude-dev|cline)-[0-9.]+\\.vsix$',kind:'Editor extension',note:'Requires a compatible editor and chosen model provider.'},
  {id:'openhands',toolId:'openhands',label:'OpenHands Agent Canvas',repo:'OpenHands/OpenHands',assetPattern:'^OpenHands-Agent-Canvas-Setup-[0-9.]+\\.exe$',kind:'Windows x64 installer',note:'Configure project access, backend runtime and provider after installing.'},
  {id:'voicebox',toolId:'voicebox',label:'Voicebox — upstream distribution',repo:'jamiepine/voicebox',assetPattern:'^Voicebox_[0-9.]+_x64-setup\\.exe$',kind:'Windows x64 installer',note:'Upstream binary, not the xfactor21 fork build. Review model/runtime downloads inside Voicebox.'},
  ...[['craft-launcher','artcraft-launcher','artcraft-launcher','ArtCraft Launcher'], ...craftApps.map(([id,name])=>[id,id,id,name])].map(([repo,toolId,prefix,label]) => ({id:toolId!,toolId:toolId!,label:label!,repo:`storytold/${repo}`,assetPattern:`^${prefix}-[0-9.]+-windows-x64\\.msi$`,kind:'Windows x64 MSI',note:'Early-development suite. ARM64/x86 builds are available on the official releases page; this offer is x64 only.'})),
  {id:'comfyui-nvidia',toolId:'comfyui',label:'ComfyUI — NVIDIA',repo:'Comfy-Org/ComfyUI',assetPattern:'^ComfyUI_windows_portable_nvidia\\.7z$',kind:'7-Zip runtime',hardware:'NVIDIA',note:'Check GPU/driver requirements; models are separate.'},
  {id:'comfyui-nvidia-cu126',toolId:'comfyui',label:'ComfyUI — NVIDIA CUDA 12.6',repo:'Comfy-Org/ComfyUI',assetPattern:'^ComfyUI_windows_portable_nvidia_cu126\\.7z$',kind:'7-Zip runtime',hardware:'NVIDIA',note:'Alternative CUDA build. Check the official README for supported GPUs/drivers; not a universal compatibility fallback.'},
  {id:'comfyui-amd',toolId:'comfyui',label:'ComfyUI — AMD',repo:'Comfy-Org/ComfyUI',assetPattern:'^ComfyUI_windows_portable_amd\\.7z$',kind:'7-Zip runtime',hardware:'AMD',note:'Check supported AMD hardware and drivers.'},
  {id:'comfyui-intel',toolId:'comfyui',label:'ComfyUI — Intel',repo:'Comfy-Org/ComfyUI',assetPattern:'^ComfyUI_windows_portable_intel\\.7z$',kind:'7-Zip runtime',hardware:'Intel',note:'Check supported Intel hardware and drivers.'},
  {id:'forge-nvidia',toolId:'forge',label:'Forge — NVIDIA',repo:'lllyasviel/stable-diffusion-webui-forge',assetPattern:'^webui_forge_cu124_torch24\\.7z$',kind:'CUDA archive',hardware:'NVIDIA',note:'CUDA compatibility and models require user setup.'},
  ...[['cpu','CPU'],['cuda124','NVIDIA'],['vulkan','AMD / Intel']].map(([suffix,hardware]) => ({id:`tabby-${suffix}`,toolId:'tabby',label:`Tabby — ${hardware}`,repo:'TabbyML/tabby',assetPattern:`^tabby_x86_64-windows-msvc-${suffix}\\.zip$`,kind:'ZIP runtime',hardware,note:'Choose hardware and configure server/models.'})),
];

export function selectAsset(source: PackageSource, releases: Release[]) {
  // /releases/latest may be a desktop/CLI release for multi-product repositories.
  // Search newest stable releases for the latest release of the requested product.
  for (const release of releases) {
    if (release.draft || release.prerelease) continue;
    const assets = release.assets.filter(a => new RegExp(source.assetPattern, 'i').test(a.name));
    if (assets.length > 1) throw new Error(`Ambiguous release assets for ${source.label}. Open the official release page.`);
    if (assets.length === 1) {
      const asset = assets[0]!;
      validateAsset(source, asset);
      return { release, asset };
    }
  }
  throw new Error(`No matching ${source.kind} in the latest stable releases. Open the official release page; no file was selected.`);
}

export function validateAsset(source: PackageSource, asset: ReleaseAsset) {
  const u = new URL(asset.browser_download_url);
  const prefix = `/${source.repo}/releases/download/`.toLowerCase();
  if (u.protocol !== 'https:' || u.hostname !== 'github.com' || u.username || u.password || !u.pathname.toLowerCase().startsWith(prefix)) throw new Error('Release asset is not from the approved project repository.');
  if (!/^[a-zA-Z0-9._-]+$/.test(asset.name) || !Number.isSafeInteger(asset.size) || asset.size <= 0) throw new Error('Invalid release filename or size.');
  if (asset.digest && !/^sha256:[a-f0-9]{64}$/i.test(asset.digest)) throw new Error('Unsupported release checksum.');
}

export async function resolveSource(source: PackageSource): Promise<Offer> {
  const response = await fetch(`https://api.github.com/repos/${source.repo}/releases?per_page=100`, {headers:{'User-Agent':`HubX/${VERSION}`,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(`Official release API returned ${response.status}${response.status===403 || response.status===429 ? ' (rate limited; try later)' : ''}.`);
  const releases = await response.json();
  if (!Array.isArray(releases)) throw new Error('Invalid release API response.');
  const {release,asset} = selectAsset(source,releases);
  return {id:source.id,label:source.label,version:release.tag_name,name:asset.name,bytes:asset.size,url:asset.browser_download_url,digest:asset.digest?.slice(7)};
}

export function validLocalUrl(value: unknown) {
  if (typeof value !== 'string') return false;
  try { const u = new URL(value); return ['http:','https:'].includes(u.protocol) && !u.username && !u.password && (u.hostname === 'localhost' || u.hostname.endsWith('.localhost') || u.hostname === '[::1]' || /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(u.hostname) || /^10\.\d+\.\d+\.\d+$/.test(u.hostname) || /^192\.168\.\d+\.\d+$/.test(u.hostname) || /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(u.hostname)); } catch { return false; }
}
export function formatBytes(n: number) { return n >= 1073741824 ? `${(n/1073741824).toFixed(2)} GiB` : `${(n/1048576).toFixed(1)} MiB`; }