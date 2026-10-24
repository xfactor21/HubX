import { test, expect } from 'bun:test';
import os from 'node:os';
import { GiB, recommendHardware, reviewedOffer, numericDriver, type HardwareReport, type GpuInfo } from '../hubx-core/hardware';
import { parseNvidiaCsv, parseWindowsProbe, mergeNvidia, nativeArchitecture } from '../packages/desktop/electron/hardware-parsers';
import { WINDOWS_PROBE, NVIDIA_ARGS, boundedCommand, scanHardware } from '../packages/desktop/electron/hardware';
import { sources, selectAsset } from '../hubx-core/releases';

const now = new Date('2026-10-23T12:00:00Z');
const gpu = (extra: Partial<GpuInfo> = {}): GpuInfo => ({ name: 'NVIDIA GeForce RTX 4090', vendor: 'NVIDIA', vramBytes: 24 * GiB, driver: '581.80', driverSource: 'nvidia-smi', computeCapability: 8.9, ...extra });
const report = (extra: Partial<HardwareReport> = {}): HardwareReport => ({ scannedAt: now.toISOString(), platform: 'win32', osName: 'Windows 11', osVersion: '10.0.26100', arch: 'x64', cpu: 'Test CPU', logicalCores: 16, ramBytes: 32 * GiB, diskFreeBytes: 100 * GiB, diskScope: 'HubX data volume', gpus: [gpu()], gpuDetection: 'complete', warnings: [], ...extra });

test('modern NVIDIA uses standard CUDA 13; legacy GTX uses cu126', () => {
  expect(recommendHardware(report(), now).sourceId).toBe('comfyui-nvidia');
  expect(recommendHardware(report({ gpus: [gpu({ name: 'NVIDIA GeForce GTX 1080', computeCapability: 6.1, driver: '560.76', vramBytes: 8 * GiB })] }), now).sourceId).toBe('comfyui-nvidia-cu126');
});
test('each reviewed modern generation is paired with verified compute capability', () => {
  for (const [model, cc] of [['2060', 7.5], ['3060', 8.6], ['4090', 8.9], ['5090', 12]] as const) {
    expect(recommendHardware(report({ gpus: [gpu({ name: `NVIDIA GeForce RTX ${model}`, computeCapability: cc })] }), now).sourceId).toBe('comfyui-nvidia');
  }
  expect(recommendHardware(report({ gpus: [gpu({ computeCapability: 12 })] }), now).status).toBe('manual');
});
test('Windows ARM64 chooses an ARM64 archive, not an x64 archive', () => {
  expect(recommendHardware(report({ arch: 'arm64' }), now).sourceId).toBe('comfyui-nvidia-arm64');
  expect(recommendHardware(report({ arch: 'arm64', gpus: [gpu({ name: 'GeForce GTX 1080', computeCapability: 6.1 })] }), now).status).toBe('manual');
  const s = sources.find(s => s.id === 'comfyui-nvidia-arm64')!;
  const a = { name: 'ComfyUI_windows_portable_nvidia_arm64.7z', size: 100, browser_download_url: `https://github.com/${s.repo}/releases/download/v1/ComfyUI_windows_portable_nvidia_arm64.7z` };
  expect(selectAsset(s, [{ tag_name: 'v1', assets: [a] }]).asset.name).toBe(a.name);
  expect(() => selectAsset(s, [{ tag_name: 'v1', assets: [{ ...a, name: 'ComfyUI_windows_portable_nvidia.7z' }] }])).toThrow();
});
for (const [name, fixture] of Object.entries({
  'AMD vendor alone': report({ gpus: [gpu({ name: 'AMD Radeon RX 7900 XTX', vendor: 'AMD', computeCapability: null, driverSource: 'OS' })] }),
  'Intel vendor alone': report({ gpus: [gpu({ name: 'Intel Arc A770', vendor: 'Intel', computeCapability: null, driverSource: 'OS' })] }),
  'multiple NVIDIA adapters': report({ gpus: [gpu(), gpu()] }),
  'hybrid Intel/NVIDIA': report({ gpus: [gpu(), gpu({ name: 'Intel UHD', vendor: 'Intel', vramBytes: null })] }),
  'unavailable GPU enumeration': report({ gpuDetection: 'unavailable' }),
  'partial GPU enumeration': report({ gpuDetection: 'partial' }),
  'no GPUs detected': report({ gpus: [] }),
  'unknown public driver': report({ gpus: [gpu({ driver: null })] }),
  'WMI driver string': report({ gpus: [gpu({ driver: '32.0.15.8180', driverSource: 'OS' })] }),
  'old modern driver': report({ gpus: [gpu({ driver: '579.99' })] }),
  'unknown capability': report({ gpus: [gpu({ computeCapability: null })] }),
  'shared/unknown VRAM': report({ gpus: [gpu({ vramBytes: null })] }),
  'insufficient VRAM': report({ gpus: [gpu({ vramBytes: 2 * GiB })] }),
  'insufficient RAM': report({ ramBytes: 4 * GiB }),
  'unknown RAM': report({ ramBytes: null }),
  'insufficient disk': report({ diskFreeBytes: 4 * GiB }),
  'unknown disk': report({ diskFreeBytes: null }),
  'Linux': report({ platform: 'linux' }),
  'macOS': report({ platform: 'darwin', arch: 'arm64' }),
  '32-bit OS': report({ arch: 'ia32' }),
  'unknown architecture': report({ arch: 'unknown' }),
  'unsupported Windows': report({ osVersion: '6.1.7601' }),
  'future GPU': report({ gpus: [gpu({ name: 'GeForce RTX 6090', computeCapability: 14 })] }),
  'professional GPU': report({ gpus: [gpu({ name: 'NVIDIA RTX A6000', computeCapability: 8.6 })] }),
  'legacy driver too old': report({ gpus: [gpu({ name: 'GTX 1080', computeCapability: 6.1, driver: '560.75' })] }),
})) test(`manual fallback: ${name}`, () => { const a = recommendHardware(fixture, now); expect(a.status).toBe('manual'); expect(a.sourceId).toBeUndefined(); expect(a.reasons.length).toBeGreaterThan(0); });

test('resource and driver floors pass at boundary, no guarantee claimed', () => {
  const a = recommendHardware(report({ ramBytes: 8 * GiB, diskFreeBytes: 20 * GiB, gpus: [gpu({ driver: '580.00', vramBytes: 4 * GiB })] }), now);
  expect(a.status).toBe('candidate'); expect(a.caveats.join(' ')).toContain('not a tested installation');
});
test('stale/future rules and unreviewed release require manual verification', () => {
  expect(recommendHardware(report(), new Date('2026-12-01')).status).toBe('manual');
  expect(recommendHardware(report(), new Date('2026-10-01')).status).toBe('manual');
  expect(reviewedOffer('comfyui-nvidia', 'v0.42.1')).toBe(true);
  expect(reviewedOffer('comfyui-nvidia', 'v0.43.0')).toBe(false);
  expect(reviewedOffer('voicebox', 'v0.42.1')).toBe(false);
});
test('nvidia-smi parsing validates types, memory, driver and cc', () => {
  const [g] = parseNvidiaCsv('NVIDIA GeForce RTX 4090, 24564, 581.80, 8.9\n');
  expect(g?.vramBytes).toBe(24564 * 1024 ** 2); expect(g?.computeCapability).toBe(8.9);
  const [unknown] = parseNvidiaCsv('NVIDIA GeForce GTX 1080, [N/A], [N/A], [N/A]');
  expect(unknown?.vramBytes).toBeNull(); expect(unknown?.driver).toBeNull(); expect(unknown?.computeCapability).toBeNull();
  expect(() => parseNvidiaCsv('bogus, 100, 581.80, 8.9')).toThrow();
  expect(() => parseNvidiaCsv('NVIDIA GPU, 10, 581.80, 8.9, injected')).toThrow();
  expect(() => parseNvidiaCsv('x'.repeat(262145))).toThrow();
});
test('Windows projection ignores serial, username and truncated AdapterRAM', () => {
  const p = parseWindowsProbe(JSON.stringify({ os: { name: 'Windows 11', version: '10.0.26100', serial: 'SECRET' }, cpu: 'CPU', ramBytes: 32 * GiB, username: 'SECRET', gpus: [{ name: 'NVIDIA GeForce RTX 4090', driver: '32.0.15.8180', AdapterRAM: 4293918720, serial: 'SECRET' }] }));
  expect(p.gpus[0]?.vramBytes).toBeNull(); expect(JSON.stringify(p)).not.toContain('SECRET');
  expect(() => parseWindowsProbe('{}')).toThrow(); expect(() => parseWindowsProbe('invalid')).toThrow();
  expect(numericDriver('32.0.15.8180')).toBeNull(); expect(numericDriver('581.80')).toBe(581.8);
});
test('matching NVIDIA lists never silently merge duplicate or mismatched adapters', () => {
  const w = gpu({ driverSource: 'OS', driver: '32.0.15.8180', vramBytes: null, computeCapability: null });
  expect(mergeNvidia([w], [gpu()]).gpus[0]?.driverSource).toBe('nvidia-smi');
  expect(mergeNvidia([w], [gpu(), gpu()]).ambiguous).toBe(true);
  expect(mergeNvidia([w], [gpu({ name: 'GeForce RTX 3060' })]).ambiguous).toBe(true);
  expect(mergeNvidia([w, w], [gpu(), gpu()]).ambiguous).toBe(true);
});
test('Windows native architecture differs from x64 process emulation on ARM', () => {
  expect(nativeArchitecture('win32', 'x64', { PROCESSOR_ARCHITEW6432: 'ARM64' })).toBe('arm64');
  expect(nativeArchitecture('win32', 'ia32', { PROCESSOR_ARCHITEW6432: 'AMD64' })).toBe('x64');
  expect(nativeArchitecture('linux', 'arm64', {})).toBe('arm64');
});
test('queries have fixed projections without identifying fields or elevation', () => {
  for (const word of ['SerialNumber', 'UUID', 'PNPDeviceID', 'UserName', 'MACAddress', 'ComputerName', 'ExecutionPolicy', 'RunAs']) expect(WINDOWS_PROBE).not.toContain(word);
  expect(NVIDIA_ARGS.join(' ')).not.toContain('uuid'); expect(NVIDIA_ARGS.join(' ')).not.toContain('serial');
});
test('query output is bounded', async () => {
  await expect(boundedCommand(process.execPath, ['-e', 'process.stdout.write("x".repeat(300000))'])).rejects.toThrow();
});
test('query timeout terminates a hanging child', async () => {
  await expect(boundedCommand(process.execPath, ['-e', 'setTimeout(()=>{},60000)'])).rejects.toThrow();
}, 12000);
test('real local scan reports basic specs and safe fields without requiring GPU', async () => {
  const r = await scanHardware(os.tmpdir());
  expect(r.platform).toBe(process.platform); expect(r.logicalCores).toBeGreaterThan(0); expect(r.ramBytes).toBeGreaterThan(0);
  expect(r.diskScope).toBe('HubX data volume'); expect(Object.keys(r).sort()).toEqual(['arch', 'cpu', 'diskFreeBytes', 'diskScope', 'gpuDetection', 'gpus', 'logicalCores', 'osName', 'osVersion', 'platform', 'ramBytes', 'scannedAt', 'warnings'].sort());
});