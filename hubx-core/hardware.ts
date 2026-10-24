export type GpuVendor = 'NVIDIA' | 'AMD' | 'Intel' | 'Apple' | 'Unknown';
export interface GpuInfo {
  name: string;
  vendor: GpuVendor;
  vramBytes: number | null;
  driver: string | null;
  driverSource: 'nvidia-smi' | 'OS' | 'unknown';
  computeCapability: number | null;
}
export interface HardwareReport {
  scannedAt: string;
  platform: string;
  osName: string;
  osVersion: string;
  arch: string;
  cpu: string;
  logicalCores: number;
  ramBytes: number | null;
  diskFreeBytes: number | null;
  diskScope: 'HubX data volume';
  gpus: GpuInfo[];
  gpuDetection: 'complete' | 'partial' | 'unavailable';
  warnings: string[];
}
export interface ScanResult { ok: boolean; report?: HardwareReport; message?: string }
export const GiB = 1024 ** 3;
export const hardwareEvidence = [
  { label: 'ComfyUI reviewed release README', url: 'https://github.com/Comfy-Org/ComfyUI/blob/v0.42.1/README.md' },
  { label: 'ComfyUI portable guide', url: 'https://docs.comfy.org/installation/comfyui_portable_windows' },
  { label: 'NVIDIA CUDA driver compatibility', url: 'https://docs.nvidia.com/deploy/cuda-compatibility/minor-version-compatibility.html' },
  { label: 'CUDA 12.6 release notes', url: 'https://docs.nvidia.com/cuda/archive/12.6.0/cuda-toolkit-release-notes/index.html' },
  { label: 'NVIDIA compute capability table', url: 'https://developer.nvidia.com/cuda/gpus' },
  { label: 'NVIDIA legacy GPU table', url: 'https://developer.nvidia.com/cuda/gpus/legacy' },
];
export const hardwarePolicy = { checkedAt: '2026-10-23', comfyRelease: 'v0.42.1', maxAgeDays: 30 };
export interface HardwareAdvice {
  status: 'candidate' | 'manual';
  title: string;
  sourceId?: string;
  reasons: string[];
  caveats: string[];
}
export function numericDriver(value: string | null): number | null {
  // WMI 32.0.15.x strings are not NVIDIA's public driver numbers.
  return value && /^\d{3}\.\d{1,2}$/.test(value) ? Number(value) : null;
}
export function recommendHardware(report: HardwareReport, now = new Date()): HardwareAdvice {
  const reasons: string[] = [];
  const caveats = [
    'A screened candidate, not a tested installation or performance guarantee. Model/workflow memory requirements vary.',
    'HubX screening policy: at least 8 GiB RAM, 4 GiB dedicated VRAM and 20 GiB free on the HubX data volume. These are conservative screening floors, not universal vendor requirements.',
    'Check the current release separately. An unreviewed release or unknown field requires manual verification. No software, driver or model is installed by this scan.',
  ];
  const age = (now.getTime() - Date.parse(hardwarePolicy.checkedAt)) / 86400000;
  if (!Number.isFinite(age) || age < 0 || age > hardwarePolicy.maxAgeDays) reasons.push('Compatibility rules are out of their 30-day review window. Review current official documentation manually.');
  if (report.platform !== 'win32') reasons.push('The managed portable offers are Windows packages; this OS needs its official native/manual installation path.');
  if (!['x64', 'arm64'].includes(report.arch)) reasons.push('Architecture is unknown or has no reviewed portable package.');
  if (report.platform === 'win32' && !report.osVersion.startsWith('10.0.')) reasons.push('Windows build could not be verified as Windows 10/11.');
  if (report.gpuDetection !== 'complete') reasons.push('GPU enumeration is partial/unavailable; HubX cannot safely identify the only active adapter.');
  if (report.gpus.length !== 1) reasons.push(report.gpus.length > 1 ? 'Multiple adapters detected. Select and verify the intended GPU manually; HubX does not guess which GPU a workflow will use.' : 'No usable GPU was detected. Review the official CPU/manual path; a missing device is not proof that the PC has no GPU.');
  if (!report.ramBytes || report.ramBytes < 8 * GiB) reasons.push('RAM is unknown or below the 8 GiB screening floor.');
  if (report.diskFreeBytes === null || report.diskFreeBytes < 20 * GiB) reasons.push('Free space is unknown or below the 20 GiB screening floor. Archives, extraction and model files require separate space.');
  const gpu = report.gpus[0];
  let sourceId: string | undefined;
  if (gpu) {
    if (gpu.vendor !== 'NVIDIA') reasons.push(`${gpu.vendor} acceleration needs an exact model/OS/driver support check. Vendor name alone does not justify selecting the AMD or Intel portable package.`);
    if (gpu.vramBytes === null || gpu.vramBytes < 4 * GiB) reasons.push('Dedicated GPU memory is unknown or below the 4 GiB screening floor. Shared memory is not dedicated VRAM.');
    if (gpu.vendor === 'NVIDIA') {
      const driver = gpu.driverSource === 'nvidia-smi' ? numericDriver(gpu.driver) : null;
      if (driver === null) reasons.push('A public NVIDIA driver version could not be verified by nvidia-smi. WMI driver strings are not converted by guesswork.');
      const cc = gpu.computeCapability;
      const modernSeries = gpu.name.match(/\b(?:GeForce\s+)?RTX\s+(20|30|40|50)\d{2}\b/i)?.[1];
      const legacySeries = gpu.name.match(/\bGTX\s+(9|10)\d{2}\b/i)?.[1];
      const modern = !!modernSeries && cc === ({ '20': 7.5, '30': 8.6, '40': 8.9, '50': 12 } as Record<string, number>)[modernSeries];
      const legacy = !!legacySeries && cc === (legacySeries === '9' ? 5.2 : 6.1);
      if (modern) {
        sourceId = report.arch === 'arm64' ? 'comfyui-nvidia-arm64' : 'comfyui-nvidia';
        if (driver !== null && driver < 580) reasons.push('Modern RTX portable uses CUDA 13; the reviewed CUDA compatibility floor is driver branch 580 or newer. Update/review the driver manually.');
      } else if (legacy && report.arch === 'x64') {
        sourceId = 'comfyui-nvidia-cu126';
        if (driver !== null && driver < 560.76) reasons.push('Legacy CUDA 12.6 uses a conservative Windows driver floor of 560.76 (toolkit GA release notes), rather than assuming limited minor-version compatibility is sufficient.');
      } else reasons.push('GPU model/compute capability is not in the reviewed GeForce RTX 20–50 / GTX 9–10 allowlist. Older, professional, future or ARM legacy GPUs need manual verification.');
    }
  }
  if (reasons.length || !sourceId) return { status: 'manual', title: 'Manual verification needed', reasons, caveats };
  return { status: 'candidate', title: sourceId === 'comfyui-nvidia-cu126' ? 'ComfyUI · legacy NVIDIA CUDA 12.6 candidate' : `ComfyUI · modern NVIDIA${report.arch === 'arm64' ? ' ARM64' : ''} candidate`, sourceId,
    reasons: [`Windows ${report.arch}; one verified ${gpu!.name} adapter.`, `nvidia-smi reports compute capability ${gpu!.computeCapability} and driver ${gpu!.driver}.`,
      sourceId === 'comfyui-nvidia-cu126' ? 'Reviewed README directs GTX 10-series/older to CUDA 12.6. Do not use that build for newer RTX GPUs.' : 'Reviewed README directs modern RTX GPUs to the standard CUDA 13 path, not the legacy CUDA 12.6 archive.',
      'RAM, dedicated VRAM and free-space screening floors passed.'], caveats };
}
export function reviewedOffer(id: string, version?: string) {
  return id.startsWith('comfyui-') && version === hardwarePolicy.comfyRelease;
}