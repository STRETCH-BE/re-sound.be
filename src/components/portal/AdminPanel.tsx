'use client';

// CLIENT PORTAL — admin panel: pricelist Excel sync + client-account manager.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, CloudUpload, Plus, RefreshCw, TriangleAlert, UserRound } from 'lucide-react';
import type { SyncReport } from '@/lib/portal/types';
import { PRICE_MARKETS } from '@/lib/portal/types';

type PortalUserRow = {
  id: string;
  email: string;
  company: string | null;
  role: 'client' | 'admin';
  markets: string[];
  allMarkets: boolean;
  active: boolean;
};

export default function AdminPanel({ demo }: { demo: boolean }) {
  const t = useTranslations('portal.admin');

  return (
    <div className="container" style={{ padding: 'clamp(26px,3.5vw,48px) 0 64px' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          textTransform: 'uppercase',
          fontSize: 'clamp(26px,3.4vw,42px)',
          margin: '0 0 6px',
        }}
      >
        {t('title')}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14.5, margin: '0 0 30px', maxWidth: 640 }}>{t('sub')}</p>

      {demo && (
        <p
          style={{
            border: '1px dashed var(--border-input)',
            background: '#fff',
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text-muted)',
            margin: '0 0 24px',
          }}
        >
          <TriangleAlert size={14} style={{ verticalAlign: -2, color: 'var(--red)' }} /> {t('demoNote')}
        </p>
      )}

      <div className="adm-grid">
        <SyncCard demo={demo} />
        <UsersCard demo={demo} />
      </div>

      <style jsx>{`
        .adm-grid {
          display: grid;
          grid-template-columns: 5fr 7fr;
          gap: 18px;
          align-items: start;
        }
        @media (max-width: 1020px) {
          .adm-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Pricelist sync
 * ------------------------------------------------------------------------ */
function SyncCard({ demo }: { demo: boolean }) {
  const t = useTranslations('portal.admin');
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<SyncReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    setReport(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/portal/sync', { method: 'POST', body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? t('syncFailed'));
      } else {
        setReport(data.report as SyncReport);
      }
    } catch {
      setError(t('syncFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2>
        <CloudUpload size={16} /> {t('syncTitle')}
      </h2>
      <p className="card__body">{t('syncBody')}</p>

      <label className="drop">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
        <span className="drop__name">{fileName ?? t('chooseFile')}</span>
        <span className="drop__hint">Alto Pricing System .xlsx</span>
      </label>

      <button type="button" className="btn btn--dark btn--sm" onClick={upload} disabled={busy || !fileName}>
        {busy ? <RefreshCw size={13} className="spin" /> : <CloudUpload size={13} />}
        {busy ? t('syncing') : t('syncButton')}
      </button>

      {error && (
        <p className="msg msg--err" role="alert">
          <TriangleAlert size={14} /> {error}
        </p>
      )}

      {report && (
        <div className="report">
          <p className="msg msg--ok">
            <CheckCircle2 size={14} />
            {report.persisted ? t('syncDone') : t('notPersisted')}
          </p>
          <dl>
            <div>
              <dt>{t('total')}</dt>
              <dd>{report.total}</dd>
            </div>
            <div>
              <dt>{t('added')}</dt>
              <dd>+{report.added}</dd>
            </div>
            <div>
              <dt>{t('changed')}</dt>
              <dd>{report.changed}</dd>
            </div>
            <div>
              <dt>{t('removed')}</dt>
              <dd>−{report.removed}</dd>
            </div>
            <div>
              <dt>{t('unchanged')}</dt>
              <dd>{report.unchanged}</dd>
            </div>
          </dl>
          {report.skipped.length > 0 && (
            <details>
              <summary>
                {t('skipped')} ({report.skipped.length})
              </summary>
              <ul>
                {report.skipped.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <style jsx>{`
        .card {
          background: #fff;
          border: 1px solid var(--border);
          padding: clamp(20px, 2.2vw, 28px);
        }
        .card h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .card__body {
          color: var(--text-muted);
          font-size: 13.5px;
          line-height: 1.6;
          margin: 0 0 18px;
        }
        .drop {
          display: block;
          border: 1px dashed var(--border-input);
          background: var(--surface);
          padding: 22px 18px;
          text-align: center;
          cursor: pointer;
          margin-bottom: 14px;
        }
        .drop input {
          display: none;
        }
        .drop__name {
          display: block;
          font-weight: 700;
          font-size: 13.5px;
          margin-bottom: 4px;
          word-break: break-all;
        }
        .drop__hint {
          font-size: 11.5px;
          color: var(--text-faint);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .msg {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          margin: 14px 0 0;
        }
        .msg--err {
          color: var(--red);
        }
        .msg--ok {
          color: #0c7a43;
        }
        .report dl {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin: 14px 0 0;
        }
        .report dl div {
          background: var(--surface);
          border: 1px solid var(--border-2);
          padding: 10px 8px;
          text-align: center;
        }
        .report dt {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted-2);
        }
        .report dd {
          margin: 4px 0 0;
          font-size: 16px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }
        .report details {
          margin-top: 12px;
          font-size: 12.5px;
          color: var(--text-muted);
        }
        .report summary {
          cursor: pointer;
          font-weight: 700;
        }
        .report ul {
          margin: 8px 0 0;
          padding-left: 18px;
          max-height: 160px;
          overflow: auto;
        }
        :global(.spin) {
          animation: adm-spin 1s linear infinite;
        }
        @keyframes adm-spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 560px) {
          .report dl {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * Client accounts
 * ------------------------------------------------------------------------ */
function UsersCard({ demo }: { demo: boolean }) {
  const t = useTranslations('portal.admin');
  const [users, setUsers] = useState<PortalUserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/portal/users');
      const data = await res.json().catch(() => null);
      if (data?.ok) setUsers(data.users as PortalUserRow[]);
      else setError(data?.error ?? 'error');
    } catch {
      setError('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleActive(u: PortalUserRow) {
    setNotice(null);
    const res = await fetch('/api/portal/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, active: !u.active }),
    });
    const data = await res.json().catch(() => null);
    if (data?.ok) {
      if (!data.persisted) setNotice(t('demoNote'));
      setUsers((prev) => prev?.map((x) => (x.id === u.id ? { ...x, active: !u.active } : x)) ?? null);
    }
  }

  return (
    <section className="card">
      <div className="card__head">
        <h2>
          <UserRound size={16} /> {t('usersTitle')}
        </h2>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={13} /> {t('createTitle')}
        </button>
      </div>
      <p className="card__body">{t('usersBody')}</p>

      {showForm && (
        <CreateForm
          demo={demo}
          onCreated={(msg) => {
            setNotice(msg);
            setShowForm(false);
            void load();
          }}
        />
      )}

      {notice && <p className="notice">{notice}</p>}
      {error && (
        <p className="notice" role="alert" style={{ color: 'var(--red)' }}>
          {t('loadFailed')}
        </p>
      )}

      {!users && !error && <p className="notice">{t('loading')}</p>}

      {users && (
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>{t('colEmail')}</th>
                <th>{t('colCompany')}</th>
                <th>{t('colRole')}</th>
                <th>{t('colMarkets')}</th>
                <th>{t('colStatus')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.active ? '' : 'off'}>
                  <td>{u.email}</td>
                  <td>{u.company ?? '—'}</td>
                  <td>{u.role === 'admin' ? t('roleAdmin') : t('roleClient')}</td>
                  <td className="mkts">{u.allMarkets ? t('allMarketsLabel') : u.markets.join(', ') || '—'}</td>
                  <td>
                    <span className={u.active ? 'pill pill--on' : 'pill'}>
                      {u.active ? t('statusActive') : t('statusInactive')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button type="button" className="linkbtn" onClick={() => toggleActive(u)}>
                      {u.active ? t('deactivate') : t('activate')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .card {
          background: #fff;
          border: 1px solid var(--border);
          padding: clamp(20px, 2.2vw, 28px);
        }
        .card__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .card h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .card__body {
          color: var(--text-muted);
          font-size: 13.5px;
          line-height: 1.6;
          margin: 8px 0 16px;
        }
        .notice {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0 0 12px;
        }
        .tablewrap {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        th {
          text-align: left;
          font-size: 10.5px;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--text-muted-2);
          font-weight: 700;
          padding: 8px 10px;
          border-bottom: 2px solid var(--black);
          white-space: nowrap;
        }
        td {
          padding: 9px 10px;
          border-bottom: 1px solid var(--border);
          vertical-align: top;
        }
        tr.off td {
          opacity: 0.55;
        }
        .mkts {
          max-width: 220px;
        }
        .pill {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 8px;
          background: var(--surface);
          border: 1px solid var(--border-2);
          color: var(--text-muted-2);
          white-space: nowrap;
        }
        .pill--on {
          background: #eaf6ef;
          border-color: #bfe3cd;
          color: #0c7a43;
        }
        .linkbtn {
          border: 0;
          background: none;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          color: var(--red);
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .linkbtn:hover {
          text-decoration: underline;
        }
      `}</style>
    </section>
  );
}

function CreateForm({ demo, onCreated }: { demo: boolean; onCreated: (msg: string) => void }) {
  const t = useTranslations('portal.admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<'client' | 'admin'>('client');
  const [allMarkets, setAllMarkets] = useState(false);
  const [markets, setMarkets] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleMarket(m: string) {
    setMarkets((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/portal/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, company, role, markets, allMarkets }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? t('createFailed'));
      } else {
        onCreated(data.persisted ? t('createdOk', { email }) : t('demoNote'));
      }
    } catch {
      setError(t('createFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form">
      <div className="grid">
        <label>
          <span>{t('colEmail')}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@company.com" />
        </label>
        <label>
          <span>{t('tempPassword')}</span>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min. 8" />
        </label>
        <label>
          <span>{t('colCompany')}</span>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
        <label>
          <span>{t('colRole')}</span>
          <select value={role} onChange={(e) => setRole(e.target.value === 'admin' ? 'admin' : 'client')}>
            <option value="client">{t('roleClient')}</option>
            <option value="admin">{t('roleAdmin')}</option>
          </select>
        </label>
      </div>

      <div className="markets">
        <span className="lbl">{t('colMarkets')}</span>
        <label className="chk chk--all">
          <input type="checkbox" checked={allMarkets || role === 'admin'} onChange={(e) => setAllMarkets(e.target.checked)} disabled={role === 'admin'} />
          {t('allMarketsLabel')}
        </label>
        {!allMarkets && role !== 'admin' && (
          <div className="chips">
            {PRICE_MARKETS.map((m) => (
              <label key={m} className={markets.includes(m) ? 'chk on' : 'chk'}>
                <input type="checkbox" checked={markets.includes(m)} onChange={() => toggleMarket(m)} />
                {m}
              </label>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="err" role="alert">
          {error}
        </p>
      )}

      <button type="button" className="btn btn--primary btn--sm" onClick={submit} disabled={busy}>
        {busy ? t('creating') : t('create')}
      </button>
      {demo && <span className="demohint">{t('demoNote')}</span>}

      <style jsx>{`
        .form {
          border: 1px solid var(--border-2);
          background: var(--surface);
          padding: 16px;
          margin: 0 0 18px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        label span,
        .lbl {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 5px;
        }
        input[type='email'],
        input[type='text'],
        select {
          width: 100%;
          padding: 10px 11px;
          border: 1px solid var(--border-input);
          background: #fff;
          font: inherit;
          font-size: 13.5px;
        }
        .markets {
          margin: 14px 0;
        }
        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        .chk {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          font-weight: 600;
          border: 1px solid var(--border-input);
          background: #fff;
          padding: 7px 10px;
          cursor: pointer;
        }
        .chk.on {
          border-color: var(--black);
          background: var(--black);
          color: #fff;
        }
        .chk input {
          accent-color: var(--red);
        }
        .chk--all {
          margin-top: 2px;
        }
        .err {
          color: var(--red);
          font-size: 13px;
          font-weight: 600;
          margin: 0 0 10px;
        }
        .demohint {
          margin-left: 12px;
          font-size: 12px;
          color: var(--text-faint);
        }
        @media (max-width: 640px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
