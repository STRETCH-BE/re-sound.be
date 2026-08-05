// "Become a STRETCH installer" — the B2B recruitment band, now a split layout:
// a full-height installer photo beside the red copy block (intro, three steps,
// and the partner / training CTAs).
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Eyebrow from '@/components/ui/Eyebrow';
import { ModalButton } from '@/components/ui/ModalButton';
import Placeholder from '@/components/ui/Placeholder';
import { homeImages } from '@/lib/home-images';

const STEP_NUMBERS = ['01', '02', '03'];

export default function InstallerPartner() {
  const t = useTranslations('home.installer');
  return (
    <section className="ip" id="installer">
      <div className="ip-split">
        <div className="ip-photo">
          <Placeholder label="STRETCH installer at work" src={homeImages.installer} alt="A certified STRETCH installer fitting a stretch ceiling" sizes="(max-width: 920px) 100vw, 50vw" decorative />
        </div>

        <div className="ip-copy">
          <div className="ip-copy-inner">
            <Eyebrow num="05" label={t('eyebrow')} tone="dark" />
            <h2 className="h2" style={{ color: '#fff', maxWidth: '15ch', margin: '0 0 18px' }}>
              {t('title')}
            </h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'rgba(255,255,255,.9)', maxWidth: 460, margin: '0 0 clamp(26px,3vw,38px)' }}>
              {t('intro')}
            </p>

            <ul className="ip-steps">
              {STEP_NUMBERS.map((n, i) => (
                <li key={n} className="ip-step">
                  <span className="ip-step-n">{n}</span>
                  <div>
                    <h3 className="ip-step-title">{t(`steps.${i}.title`)}</h3>
                    <p className="ip-step-body">{t(`steps.${i}.body`)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 'clamp(28px,3vw,38px)' }}>
              <ModalButton type="partner" source="home_installer" className="btn btn--dark">
                {t('ctaPartner')} →
              </ModalButton>
              <Link href="/installer-training" className="btn btn--ghost-light">
                {t('ctaTraining')} →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .ip { background: var(--red); }
        .ip-split { display: grid; grid-template-columns: 1fr 1fr; align-items: stretch; min-height: 580px; }
        .ip-photo { position: relative; overflow: hidden; }
        .ip-photo > * { width: 100%; height: 100%; }
        .ip-copy { background: var(--red); color: #fff; display: flex; align-items: center; }
        .ip-copy-inner { padding: clamp(40px,5vw,84px) clamp(28px,5vw,72px); width: 100%; max-width: 620px; }
        .ip-steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0; border-top: 1px solid rgba(255,255,255,.28); }
        .ip-step { display: flex; gap: 18px; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,.28); }
        .ip-step-n { font-family: var(--font-display); font-weight: 800; color: rgba(255,255,255,.7); font-size: 14px; letter-spacing: .05em; flex-shrink: 0; padding-top: 2px; }
        .ip-step-title { font-family: var(--font-display); font-weight: 800; font-size: 18px; letter-spacing: -.01em; margin: 0 0 6px; color: #fff; }
        .ip-step-body { font-size: 14px; line-height: 1.55; color: rgba(255,255,255,.9); margin: 0; }
        @media (max-width: 920px) {
          .ip-split { grid-template-columns: 1fr; }
          .ip-photo { min-height: 320px; order: -1; }
        }
      ` }} />
    </section>
  );
}
