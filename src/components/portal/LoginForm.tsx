'use client';

// CLIENT PORTAL — credential form. Posts to /api/portal/login, then refreshes
// so the server layout picks up the new session. In demo mode the preview
// accounts are listed right on the card (demo mode is intentionally public).
import { useState, type FormEvent } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Lock } from 'lucide-react';
import { DEMO_USERS } from '@/lib/portal/demo-users';

export default function LoginForm({ demo }: { demo: boolean }) {
  const t = useTranslations('portal.login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.replace('/portal');
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => null);
      setError(data?.error === 'inactive' ? t('inactive') : t('invalid'));
    } catch {
      setError(t('failed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      <form
        onSubmit={submit}
        style={{ background: '#fff', border: '1px solid var(--border)', padding: 'clamp(26px,3vw,40px)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={{ background: 'var(--black)', color: '#fff', width: 38, height: 38, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={16} />
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '.04em', textTransform: 'uppercase' }}>{t('formTitle')}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted-2)' }}>{t('formSub')}</div>
          </div>
        </div>

        <label className="portal-field">
          <span>{t('email')}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            placeholder="name@company.com"
          />
        </label>
        <label className="portal-field">
          <span>{t('password')}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            placeholder="••••••••••"
          />
        </label>

        {error && (
          <p role="alert" style={{ color: 'var(--red)', fontSize: 13.5, fontWeight: 600, margin: '4px 0 14px' }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn btn--primary" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
          {busy ? t('submitting') : t('submit')} <ArrowUpRight size={15} />
        </button>
      </form>

      {demo && (
        <aside
          style={{ marginTop: 16, border: '1px dashed var(--border-input)', background: '#fff', padding: '16px 18px', fontSize: 13 }}
        >
          <p style={{ margin: '0 0 8px', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', fontSize: 11.5 }}>
            <span style={{ color: 'var(--red)' }}>●</span> {t('demoTitle')}
          </p>
          <p style={{ margin: '0 0 10px', color: 'var(--text-muted)', lineHeight: 1.55 }}>{t('demoBody')}</p>
          <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-body)', lineHeight: 1.7 }}>
            {DEMO_USERS.map((u) => (
              <li key={u.email}>
                <code style={{ fontSize: 12.5 }}>{u.email}</code> / <code style={{ fontSize: 12.5 }}>{u.password}</code>
                <span style={{ color: 'var(--text-faint)' }}> — {u.company}</span>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <style jsx>{`
        .portal-field {
          display: block;
          margin-bottom: 16px;
        }
        .portal-field span {
          display: block;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 7px;
        }
        .portal-field input {
          width: 100%;
          padding: 13px 14px;
          border: 1px solid var(--border-input);
          background: #fff;
          font: inherit;
          font-size: 14.5px;
          border-radius: var(--radius);
        }
        .portal-field input:focus {
          outline: 2px solid var(--black);
          outline-offset: -1px;
        }
      `}</style>
    </div>
  );
}
