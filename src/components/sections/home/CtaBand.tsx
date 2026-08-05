// Closing CTA — a full-bleed photo band under a dark overlay (not flat black),
// with the primary quote CTA, a dealer link and the phone line.
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ModalButton } from '@/components/ui/ModalButton';
import Placeholder from '@/components/ui/Placeholder';
import { homeImages } from '@/lib/home-images';
import { contact } from '@/lib/site-config';

export default function CtaBand() {
  const t = useTranslations('ctaBand');
  return (
    <section className="cta-band" id="cta">
      <div className="cta-bg" aria-hidden="true">
        <Placeholder label="Closing CTA — finished interior" src={homeImages.ctaBand} alt="" sizes="100vw" decorative />
      </div>
      <div className="cta-ov" aria-hidden="true" />

      <div className="container cta-inner">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ width: 30, height: 2, background: 'var(--red)' }} />
          <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--on-dark-soft)' }}>
            {t('kicker')}
          </span>
          <span style={{ width: 30, height: 2, background: 'var(--red)' }} />
        </span>

        <h2 className="h2" style={{ color: '#fff', margin: '0 auto', maxWidth: '18ch' }}>
          {t('title')}<span className="accent">?</span>
        </h2>

        <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--on-dark-soft)', maxWidth: 560, margin: '22px auto 34px' }}>
          {t('sub')}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
          <ModalButton type="quote" source="home_cta" trackQuote className="btn btn--primary btn--lg">
            {t('quote')} →
          </ModalButton>
          <Link href="/contact" className="btn btn--ghost-light btn--lg">
            {t('dealer')}
          </Link>
        </div>

        <p style={{ marginTop: 30, fontSize: 13.5, color: 'var(--on-dark-soft)' }}>
          {t('preferTalk')}{' '}
          <a href={contact.phoneHref} style={{ color: '#fff', fontWeight: 600 }}>
            {contact.phoneDisplay}
          </a>{' '}
          · {contact.hoursDisplay}
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .cta-band { position: relative; overflow: hidden; background: var(--black); text-align: center; }
        .cta-bg { position: absolute; inset: 0; }
        .cta-bg > * { width: 100%; height: 100%; }
        .cta-ov { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(10,10,10,.72) 0%, rgba(10,10,10,.8) 55%, rgba(10,10,10,.88) 100%); }
        .cta-inner { position: relative; z-index: 2; padding: clamp(76px,11vw,150px) 0; }
      ` }} />
    </section>
  );
}
