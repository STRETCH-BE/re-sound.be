// CLIENT PORTAL — login (/portal/login).
// Split layout: black brand panel + the credential form. When Supabase is not
// configured the page runs in demo mode and lists the preview accounts.
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { isValidLocale, type Locale } from '@/i18n/config';
import { getPortalSession } from '@/lib/portal/auth';
import { isSupabaseConfigured } from '@/lib/portal/supabase';
import LoginForm from '@/components/portal/LoginForm';

export default async function PortalLoginPage({ params }: { params: { locale: string } }) {
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  setRequestLocale(locale);

  // Already signed in → straight to the portal.
  const session = await getPortalSession();
  if (session) redirect({ href: '/portal', locale });

  const t = await getTranslations('portal.login');
  const demo = !isSupabaseConfigured();

  return (
    <div className="portal-login">
      <section className="portal-login__brand">
        <div>
          <p className="eyebrow" style={{ color: 'var(--on-dark-muted)' }}>
            <span style={{ background: 'var(--red)', width: 10, height: 10, display: 'inline-block', marginRight: 12 }} />
            {t('eyebrow')}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 'clamp(40px, 5vw, 72px)',
              lineHeight: 0.98,
              margin: '18px 0 22px',
              color: '#fff',
              textTransform: 'uppercase',
            }}
          >
            {t('title')}
          </h1>
          <p style={{ color: 'var(--on-dark-soft)', fontSize: 16, lineHeight: 1.65, maxWidth: 460, margin: 0 }}>
            {t('sub')}
          </p>
        </div>
        <p style={{ color: 'var(--on-dark-faint)', fontSize: 12.5, letterSpacing: '.14em', textTransform: 'uppercase', margin: 0 }}>
          STRETCH<span style={{ color: 'var(--red)' }}>®</span> — {t('eyebrow')}
        </p>
      </section>

      <section className="portal-login__form">
        <LoginForm demo={demo} />
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .portal-login { display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - 220px); }
        .portal-login__brand { background: var(--black); padding: clamp(32px,5vw,72px); display: flex; flex-direction: column; justify-content: space-between; gap: 40px; }
        .portal-login__form { display: flex; align-items: center; justify-content: center; padding: clamp(28px,4vw,64px); background: var(--surface); }
        @media (max-width: 900px) {
          .portal-login { grid-template-columns: 1fr; }
          .portal-login__brand { min-height: auto; }
        }
      ` }} />
    </div>
  );
}
