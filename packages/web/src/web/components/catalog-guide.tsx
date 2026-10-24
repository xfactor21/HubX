import { guides } from '../../../../../hubx-core/guides';
import { snapshots } from '../../../../../hubx-core/snapshots';

export function CatalogGuide({ id }: { id: string }) {
  const guide = guides[id];
  const snapshot = snapshots[id];
  if (!guide || !snapshot) return null;
  return <section className="catalog-guide" aria-label="Installation instructions">
    <h3>Version & maintenance</h3>
    <p><strong>{snapshot.archived ? 'Archived repository' : snapshot.release || 'Source-only snapshot'}</strong> · Checked {snapshot.checkedAt}</p>
    <p>{snapshot.note}</p>
    <p className="snapshot-meta">Source commit {snapshot.commit.slice(0, 8)} · {snapshot.commitDate.slice(0, 10)}{snapshot.releaseDate ? ` · Release published ${snapshot.releaseDate.slice(0, 10)}` : ''}</p>
    <h3>Before you start</h3>
    <ul>{guide.prerequisites.map(text => <li key={text}>{text}</li>)}</ul>
    <h3>Installation walkthrough</h3>
    <ol>{guide.steps.map(text => <li key={text}>{text}</li>)}</ol>
    {guide.commands && <><p className="snapshot-meta">Manual commands · review prerequisites first. HubX does not execute these. Run Python commands inside an activated isolated environment.</p><pre className="guide-command"><code>{guide.commands}</code></pre></>}
    <h3>Launch & register</h3><p>{guide.launch}</p>
    <h3>Updating safely</h3><p>{guide.update}</p>
    <h3>If something fails</h3><p>{guide.troubleshooting}</p>
    <p className="snapshot-meta">Instructions were reviewed against official documentation on {snapshot.checkedAt}. Third-party installations have not all been executed on Windows; verify current prerequisites on the official guide.</p>
  </section>;
}

export function CatalogVersion({ id }: { id: string }) {
  const s = snapshots[id];
  return s ? <p className={`catalog-version ${s.archived ? 'maintenance-warning' : ''}`}>{s.archived ? 'Archived · legacy' : s.release || `Source ${s.commit.slice(0, 7)}`}<span>Verified {s.checkedAt} · not your installed version</span></p> : null;
}