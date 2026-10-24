import { GiB, type GpuInfo, type GpuVendor } from '../../../hubx-core/hardware';

export const cleanText = (value: unknown, max = 160) => typeof value === 'string' ? Array.from(value.slice(0, max), char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127 ? ' ' : char).join('').trim() : '';
export function positiveNumber(value: unknown, maximum = 1024 * 1024 * GiB): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n <= maximum ? n : null;
}
export function vendorFromName(name: string): GpuVendor {
  if (/nvidia|geforce|quadro/i.test(name)) return 'NVIDIA';
  if (/amd|radeon|advanced micro devices/i.test(name)) return 'AMD';
  if (/intel/i.test(name)) return 'Intel';
  if (/apple/i.test(name)) return 'Apple';
  return 'Unknown';
}
export function parseNvidiaCsv(text: string): GpuInfo[] {
  if (text.length > 262144) throw new Error('GPU response too large.');
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length > 32) throw new Error('Too many adapters.');
  return lines.map(line => {
    const parts = line.split(',').map(p => p.trim());
    const [name, memory, driver, capability] = parts;
    if (parts.length !== 4 || !name || !/^(?:NVIDIA\s+)?(?:GeForce|RTX|GTX|Quadro|Tesla|NVIDIA|[AHV]\d)/i.test(name)) throw new Error('Unrecognized GPU response.');
    const mib = positiveNumber(memory, 1024 * 1024);
    const cc = capability && /^\d{1,2}\.\d$/.test(capability) ? positiveNumber(capability, 20) : null;
    return { name: cleanText(name), vendor: 'NVIDIA', vramBytes: mib ? mib * 1024 ** 2 : null,
      driver: driver && /^\d{3}\.\d{1,2}$/.test(driver) ? driver : null, driverSource: 'nvidia-smi', computeCapability: cc };
  });
}
export function parseWindowsProbe(text: string) {
  if (text.length > 262144) throw new Error('OS response too large.');
  const value = JSON.parse(text.replace(/^﻿/, ''));
  if (!value || typeof value !== 'object' || Array.isArray(value) || !value.os || !Array.isArray(value.gpus) || value.gpus.length > 32) throw new Error('Invalid OS response.');
  const gpus: GpuInfo[] = value.gpus.map((gpu: any) => {
    const name = cleanText(gpu?.name);
    if (!name) throw new Error('Invalid GPU name.');
    return { name, vendor: vendorFromName(name), driver: cleanText(gpu.driver) || null, driverSource: 'OS', vramBytes: null, computeCapability: null };
  });
  return { osName: cleanText(value.os.name) || 'Windows', osVersion: cleanText(value.os.version),
    cpu: cleanText(value.cpu), ramBytes: positiveNumber(value.ramBytes), gpus };
}
export function mergeNvidia(osGpus: GpuInfo[], nvidia: GpuInfo[]): { gpus: GpuInfo[]; ambiguous: boolean } {
  const existing = osGpus.filter(g => g.vendor === 'NVIDIA');
  if (!existing.length) return { gpus: [...osGpus, ...nvidia], ambiguous: false };
  if (existing.length !== nvidia.length) return { gpus: osGpus, ambiguous: true };
  const normalize = (s: string) => s.toLowerCase().replace(/^nvidia\s+/, '').replace(/\s+/g, ' ').trim();
  const used = new Set<number>();
  let ambiguous = false;
  const gpus = osGpus.map(g => {
    if (g.vendor !== 'NVIDIA') return g;
    const matches = nvidia.map((n, i) => ({ n, i })).filter(({ n, i }) => !used.has(i) && normalize(n.name) === normalize(g.name));
    if (matches.length !== 1) { ambiguous = true; return g; }
    used.add(matches[0]!.i); return matches[0]!.n;
  });
  return { gpus, ambiguous };
}
export function nativeArchitecture(platform: string, processArch: string, env: Record<string, string | undefined>): string {
  if (platform !== 'win32') return processArch;
  const native = (env.PROCESSOR_ARCHITEW6432 || env.PROCESSOR_ARCHITECTURE || '').toUpperCase();
  if (native === 'ARM64') return 'arm64';
  if (native === 'AMD64') return 'x64';
  if (native === 'X86') return 'ia32';
  return processArch;
}