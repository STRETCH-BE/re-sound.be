// "Why stretch" — image-led split on a dark section: a tall photo beside a 2×2
// grid of benefit cards. The fourth card is red and carries the survey CTA.
import { useTranslations } from 'next-intl';
import Eyebrow from '@/components/ui/Eyebrow';
import Placeholder from '@/components/ui/Placeholder';
import { ModalTextLink } from '@/components/ui/ModalButton';
import { homeImages } from '@/lib/home-images';

const CELL_NUMBERS = ['01', '02', '03'];

export default function WhyStretch() {
  const t = useTranslations('home.why');
  return (
    <section className="section--dark" id="why">
      <div className="container section">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 'clamp(40px,5vw,68px)' }}>
          <div>
            <Eyebrow num="01" label={t('eyebrow')} tone="dark" />
            <h2 className="h2" style={{ maxWidth: '13ch' }}>
              {t('title')}
            </h2>
          </div>
          <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--on-dark-muted-2)', maxWidth: 360, margin: 0 }}>
            {t('intro')}
          </p>
        </div>

        <div className="why-split">
          <div className="why-photo">
            <div className="why-photo-img">
              <Placeholder label="Why STRETCH — finished room" src={homeImages.whyStretch} alt="A flawless STRETCH ceiling in a finished interior" sizes="(max-width: 900px) 100vw, 48vw" decorative />
            </div>
          </div>

          <div className="why-cards">
            {CELL_NUMBERS.map((n, i) => (
              <div key={n} className="why-card">
                <div className="why-card-n">{n}</div>
                <div>
                  <h3 className="why-card-title">{t(`cells.${i}.title`)}</h3>
                  <p className="why-card-body">{t(`cells.${i}.body`)}</p>
                </div>
              </div>
            ))}
            <div className="why-card why-card--red">
              <div className="why-card-n why-card-n--light">04</div>
              <div>
                <h3 className="why-card-title">{t('seeIt')}</h3>
                <ModalTextLink
                  type="survey"
                  source="why_stretch"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '.04em', textTransform: 'uppercase', borderBottom: '2px solid #fff', paddingBottom: 4 }}
                >
                  {t('bookSurvey')} ↗
                </ModalTextLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .why-split { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: stretch; }
        .why-photo { position: relative; overflow: hidden; min-height: 520px; border: 1px solid var(--border-dark, #2a2a2a); }
        .why-photo-img { position: absolute; inset: 0; }
        .why-photo-img > * { width: 100%; height: 100%; }
        .why-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.14); }
        .why-card { background: var(--black); padding: clamp(24px,2.6vw,38px); display: flex; flex-direction: column; justify-content: space-between; gap: 28px; }
        .why-card--red { background: var(--red); }
        .why-card-n { font-family: var(--font-display); font-weight: 800; color: var(--red); font-size: 14px; letter-spacing: .05em; }
        .why-card-n--light { color: #fff; }
        .why-card-title { font-family: var(--font-display); font-weight: 800; font-size: clamp(18px,1.7vw,22px); letter-spacing: -.01em; margin: 0 0 12px; color: #fff; }
        .why-card-body { font-size: 14px; line-height: 1.6; color: var(--on-dark-muted); margin: 0; }
        @media (max-width: 900px) {
          .why-split { grid-template-columns: 1fr; }
          .why-photo { min-height: 340px; }
        }
        @media (max-width: 480px) {
          .why-cards { grid-template-columns: 1fr; }
        }
      ` }} />
    </section>
  );
}
