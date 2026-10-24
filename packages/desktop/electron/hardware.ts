import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { type HardwareReport, type GpuInfo } from '../../../hubx-core/hardware';
import { cleanText, positiveNumber, parseNvidiaCsv, parseWindowsProbe, mergeNvidia, nativeArchitecture } from './hardware-parsers';

// Fixed, read-only projection: deliberately excludes UUID, serial, hostname,
// PNPDeviceID, usernames, network adapters, environment or installed applications.
export const WINDOWS_PROBE = `$ErrorActionPreference='Stop'; [Console]::OutputEncoding=[System.Text.Encoding]::UTF8; $o=Get-CimInstance Win32_OperatingSystem; $c=Get-CimInstance Win32_Processor | Select-Object -First 1; $m=Get-CimInstance Win32_ComputerSystem; $g=@(Get-CimInstance Win32_VideoController | ForEach-Object { @{name=$_.Name;driver=$_.DriverVersion} }); @{os=@{name=$o.Caption;version=$o.Version};cpu=$c.Name;ramBytes=$m.TotalPhysicalMemory;gpus=$g} | ConvertTo-Json -Depth 4 -Compress`;
export const NVIDIA_ARGS = ['--query-gpu=name,memory.total,driver_version,compute_cap', '--format=csv,noheader,nounits'];

export function boundedCommand(file: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(file, args, { timeout: 8000, maxBuffer: 262144, encoding: 'utf8', windowsHide: true, shell: false }, (error, stdout) => {
      if (error) reject(new Error('Local query unavailable, failed or timed out.'));
      else resolve(stdout);
    });
  });
}
async function readSmall(file: string) {
  const data = await fs.readFile(file, { encoding: 'utf8', signal: AbortSignal.timeout(1000) });
  if (data.length > 4096) throw new Error('Unexpectedly large local field.');
  return data.trim();
}
async function nvidiaProbe(): Promise<GpuInfo[]> {
  const system = process.env.SystemRoot || 'C:\\Windows';
  const candidates = process.platform === 'win32' ? [path.join(system, 'System32', 'nvidia-smi.exe'), path.join(process.env.ProgramFiles || 'C:\\Program Files', 'NVIDIA Corporation', 'NVSMI', 'nvidia-smi.exe')] : ['/usr/bin/nvidia-smi'];
  const file = (await Promise.all(candidates.map(async p => await fs.access(p).then(() => p).catch(() => null)))).find(Boolean);
  if (!file) throw new Error('NVIDIA query is unavailable.');
  return parseNvidiaCsv(await boundedCommand(file, NVIDIA_ARGS));
}
async function linuxGpuProbe(): Promise<{ gpus: GpuInfo[]; partial: boolean }> {
  const allCards = (await fs.readdir('/sys/class/drm')).filter(n => /^card\d+$/.test(n));
  const cards = allCards.slice(0, 32);
  const gpus: GpuInfo[] = [];
  let partial = allCards.length > 32;
  for (const card of cards) {
    try {
      const device = `/sys/class/drm/${card}/device`;
      const id = await readSmall(`${device}/vendor`);
      const vendor = id === '0x10de' ? 'NVIDIA' : id === '0x1002' ? 'AMD' : id === '0x8086' ? 'Intel' : 'Unknown';
      // Product ID is a model identifier, not a unique device/serial identifier.
      const product = await readSmall(`${device}/device`).catch(() => 'unknown');
      const bytes = vendor === 'AMD' ? positiveNumber(await readSmall(`${device}/mem_info_vram_total`).catch(() => '')) : null;
      gpus.push({ name: `${vendor} adapter (${product})`, vendor, vramBytes: bytes, driver: null, driverSource: 'unknown', computeCapability: null });
    } catch { partial = true; }
  }
  return { gpus, partial };
}

export async function scanHardware(dataVolume: string): Promise<HardwareReport> {
  const cpus = os.cpus();
  const report: HardwareReport = { scannedAt: new Date().toISOString(), platform: process.platform,
    osName: os.type(), osVersion: os.release(), arch: nativeArchitecture(process.platform, process.arch, process.env),
    cpu: cleanText(cpus[0]?.model) || 'Unknown', logicalCores: cpus.length, ramBytes: positiveNumber(os.totalmem()), diskFreeBytes: null,
    diskScope: 'HubX data volume', gpus: [], gpuDetection: 'unavailable', warnings: [] };
  await fs.statfs(dataVolume).then(s => { const free = s.bavail * s.bsize; report.diskFreeBytes = Number.isSafeInteger(free) && free >= 0 ? free : null; }).catch(() => report.warnings.push('Free space for the HubX data volume could not be read.'));
  if (process.platform === 'win32') {
    try {
      const executable = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
      const parsed = parseWindowsProbe(await boundedCommand(executable, ['-NoProfile', '-NonInteractive', '-Command', WINDOWS_PROBE]));
      Object.assign(report, parsed); report.gpuDetection = 'complete';
    } catch { report.warnings.push('Windows read-only OS/GPU query failed or timed out; remaining basic fields may be available.'); }
    try {
      const nvidia = await nvidiaProbe();
      const missingFromOS = report.gpuDetection === 'complete' && !report.gpus.some(g => g.vendor === 'NVIDIA') && nvidia.length > 0;
      const merged = mergeNvidia(report.gpus, nvidia);
      report.gpus = merged.gpus;
      if (merged.ambiguous || missingFromOS) { report.gpuDetection = 'partial'; report.warnings.push('NVIDIA and OS adapter lists did not match unambiguously.'); }
    } catch { if (report.gpus.some(g => g.vendor === 'NVIDIA')) report.warnings.push('nvidia-smi was unavailable or did not return a validated response; dedicated VRAM, compute capability and public NVIDIA driver remain unknown.'); }
    if (report.gpus.some(g => g.vramBytes === null)) report.warnings.push('WMI AdapterRAM is not used: it can truncate larger VRAM values and includes unreliable/shared-memory reports.');
  } else if (process.platform === 'linux') {
    report.warnings.push('Specs are OS-reported; a virtual machine/container may expose host resources rather than its usable process limits. No Windows portable is recommended on Linux.');
    const osRelease = await readSmall('/etc/os-release').catch(() => '');
    const pretty = osRelease.match(/^PRETTY_NAME="?([^"\n]+)"?$/m)?.[1];
    if (pretty) report.osName = cleanText(pretty);
    try { const result = await linuxGpuProbe(); report.gpus = result.gpus; report.gpuDetection = result.partial ? 'partial' : 'complete'; }
    catch { report.warnings.push('Linux GPU devices are unavailable in this environment (common in containers/VMs).'); }
    try {
      const nvidia = await nvidiaProbe();
      const nonNvidia = report.gpus.filter(g => g.vendor !== 'NVIDIA');
      const oldCount = report.gpus.filter(g => g.vendor === 'NVIDIA').length;
      if (oldCount && oldCount !== nvidia.length) report.gpuDetection = 'partial';
      report.gpus = [...nonNvidia, ...nvidia];
    } catch { if (report.gpus.some(g => g.vendor === 'NVIDIA')) report.warnings.push('NVIDIA details unavailable; driver/VRAM/compute capability may be unknown.'); }
  } else report.warnings.push('This phase provides detailed GPU queries for Windows/Linux only; other systems need their official installation path.');
  if (!report.gpus.length) report.warnings.push('No adapters could be reported. This is not a claim that the physical machine has no GPU.');
  return report;
}