import { useEffect, useRef, useState } from 'react';
import { hardwareEvidence, hardwarePolicy, recommendHardware, type HardwareReport } from '../../../../../hubx-core/hardware';
import { formatBytes } from '../../../../../hubx-core/releases';
import { hub } from '../lib/hubx';

function ScanConsent({ close, confirm }: { close: () => void; confirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [consent, setConsent] = useState(false);
  useEffect(() => { const el = dialog.current; el?.showModal(); return () => el?.close(); }, []);
  return <dialog ref={dialog} onCancel={close} aria-labelledby="hardware-consent-title"><div className="modal-shell">
    <button className="icon-button" aria-label="Close scan consent" onClick={close}>×</button>
    <p className="planet-presents">LOCAL · READ-ONLY · OPTIONAL</p><h2 id="hardware-consent-title">Review the hardware scan</h2>
    <p>Read OS/build, native architecture, CPU model/core count, RAM, GPU model, dedicated VRAM and driver/compute capability where available, plus free space on the HubX data volume.</p>
    <p>No serial numbers, device UUIDs, account names or network inventory. No admin elevation, driver changes, downloads or installation. Results stay in this window’s memory; HubX does not save or upload them. The managed preview retains ordinary platform analytics, not scan contents.</p>
    <p>Fixed OS queries have time/output limits. Windows and NVIDIA queries can take up to roughly 20 seconds. Missing or ambiguous data produces a manual fallback.</p>
    <label className="scan-consent-check"><input type="checkbox" aria-label="I consent to a local, read-only hardware scan" checked={consent} onChange={e => setConsent(e.target.checked)}/> I consent to a local, read-only hardware scan.</label>
    <div className="dialog-actions"><button className="primary" disabled={!consent} onClick={confirm}>Run local scan</button><button className="secondary" onClick={close}>Not now</button></div>
  </div></dialog>;
}
const memory = (n: number | null) => n === null ? 'Unknown' : formatBytes(n);

export function HardwarePanel({ native, onManual, onReview, onOfficial }: { native: boolean; onManual: () => void; onReview: (id: string) => void; onOfficial: (url: string) => void }) {
  const [consentOpen, setConsentOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState<HardwareReport | null>(null);
  const [error, setError] = useState('');
  const run = async () => {
    setConsentOpen(false); setScanning(true); setReport(null); setError('');
    try { const result = await hub().scanHardware(true); if (result.ok && result.report) setReport(result.report); else setError(result.message || 'Scan failed. Choose packages manually.'); }
    catch { setError('The native scan could not finish. Choose packages manually.'); }
    finally { setScanning(false); }
  };
  const advice = report ? recommendHardware(report) : null;
  return <section className="hardware-panel" aria-labelledby="hardware-heading">
    <div className="hardware-heading"><div><p className="eyebrow">YOUR MACHINE · YOUR CHOICE</p><h2 id="hardware-heading">The right runtime starts here.</h2><p>Scan locally to screen a ComfyUI package. Review the specs and reasoning before any download.</p></div>
      <div className="hardware-actions"><button className="primary" disabled={!native || scanning} onClick={() => setConsentOpen(true)}>{scanning ? 'Scanning locally…' : report ? 'Scan again' : 'Scan my hardware'}</button><button className="secondary" onClick={onManual}>Choose packages manually</button></div>
    </div>
    {!native && <p className="hardware-unavailable">Native desktop scan only. This browser preview cannot read your PC’s specifications. Manual official links remain available.</p>}
    <p className="hardware-privacy">Optional · No admin access · No serial numbers · No hardware upload · Not saved</p>
    {scanning && <output>Reading local specifications. No network release check or installation is being performed.</output>}
    {error && <p className="error-text" role="alert">{error}</p>}
    {report && <div className="hardware-results">
      <div className="hardware-result-title"><h3>Local scan results</h3><span>{new Date(report.scannedAt).toLocaleString()} · {report.gpuDetection === 'complete' ? 'GPU list read' : 'Partial scan'}</span><button className="text-button" onClick={() => { setReport(null); setError(''); }}>Forget scan results</button></div>
      <dl className="spec-grid"><div><dt>Operating system</dt><dd>{report.osName} · {report.osVersion}</dd></div><div><dt>Native architecture</dt><dd>{report.arch}</dd></div><div><dt>CPU</dt><dd>{report.cpu} · {report.logicalCores} logical cores</dd></div><div><dt>System memory</dt><dd>{memory(report.ramBytes)}</dd></div><div><dt>Free disk</dt><dd>{memory(report.diskFreeBytes)} · {report.diskScope}</dd></div><div><dt>GPU detection</dt><dd>{report.gpus.length} reported · {report.gpuDetection}</dd></div></dl>
      <div className="gpu-list">{report.gpus.map((gpu, i) => <article key={i}><strong>{gpu.name}</strong><p>{gpu.vendor} · Dedicated VRAM {memory(gpu.vramBytes)}</p><p>Driver {gpu.driver || 'Unknown'} ({gpu.driverSource}) · Compute capability {gpu.computeCapability ?? 'Unknown'}</p></article>)}</div>
      {report.warnings.length > 0 && <ul className="hardware-warnings">{report.warnings.map(w => <li key={w}>{w}</li>)}</ul>}
      {advice && <article className={`hardware-advice ${advice.status}`} aria-live="polite"><p className="eyebrow">{advice.status === 'candidate' ? 'SCREENED CANDIDATE · NOT CERTIFIED' : 'NO PACKAGE AUTO-SELECTED'}</p><h3>{advice.title}</h3><ul>{advice.reasons.map(r => <li key={r}>{r}</li>)}</ul><details><summary>Limits and screening policy</summary><ul>{advice.caveats.map(c => <li key={c}>{c}</li>)}</ul></details>
        {advice.sourceId && <button className="primary" onClick={() => onReview(advice.sourceId!)}>Review candidate package</button>}
        <p className="snapshot-meta">Rules reviewed {hardwarePolicy.checkedAt} against {hardwarePolicy.comfyRelease}. Only this release is reviewed; later releases need manual verification. Windows x64 general installers are architecture-matched only on Windows x64; model/runtime requirements are separate.</p>
        <div className="hardware-source-links">{hardwareEvidence.map(e => <button className="text-button" key={e.url} onClick={() => onOfficial(e.url)}>{e.label} ↗</button>)}</div>
      </article>}
    </div>}
    {consentOpen && <ScanConsent close={() => setConsentOpen(false)} confirm={() => void run()}/>}
  </section>;
}