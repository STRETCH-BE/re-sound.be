// "Two systems. One finish." — Polyester and PVC as two tall, full-image cards
// with the copy overlaid on a bottom gradient and a subtle zoom on hover.
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Eyebrow from '@/components/ui/Eyebrow';
import Placeholder from '@/components/ui/Placeholder';
import { homeImages } from '@/lib/home-images';

const SOLUTION_CARDS = [
  { href: '/products/polyester-stretch-ceiling', img: homeImages.solutionsPolyester, light: true },
  { href: '/products/pvc-stretch-ceiling', img: homeImages.solutionsPvc, light: false },
];

export default function Solutions() {
  const t = useTranslations('home.solutions');
  return (
    <section className="container section" id="solutions">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 'clamp(36px,4vw,56px)' }}>
        <div>
          <Eyebrow num="02" label={t('eyebrow')} />
          <h2 className="h2">
            {t('title1')}
            <br />
            {t('title2')}
          </h2>
        </div>
        <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: 340, margin: 0 }}>
          {t('intro')}
        </p>
      </div>

      <div className="sol-grid">
        {SOLUTION_CARDS.map((s, ci) => (
          <Link key={s.href} href={s.href} className="sol-card zoom-wrap">
            <div className="sol-img">
              <Placeholder label={`${t(`cards.${ci}.name`)} ceiling photo`} src={s.img} alt={t(`cards.${ci}.alt`)} sizes="(max-width: 760px) 100vw, 45vw" light={s.light} className="zoom-img" decorative />
            </div>
            <div className="sol-overlay">
              <div className="sol-tags">
                <span className="sol-tag sol-tag--red">{t(`cards.${ci}.mount`)}</span>
                <span className="sol-tag">{t(`cards.${ci}.span`)}</span>
              </div>
              <h3 className="sol-name">{t(`cards.${ci}.name`)}</h3>
              <p className="sol-blurb">{t(`cards.${ci}.blurb`)}</p>
              <ul className="sol-features">
                {[0, 1, 2, 3].map((fi) => (
                  <li key={fi}><span className="tick tick--sm" />{t(`cards.${ci}.features.${fi}`)}</li>
                ))}
              </ul>
              <span className="sol-link">{t(`cards.${ci}.cta`)} <span style={{ color: 'var(--red)' }}>&rarr;</span></span>
            </div>
          </Link>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .sol-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .sol-card { position: relative; display: block; overflow: hidden; min-height: 600px; border: 1px solid var(--border); background: var(--black); }
        .sol-img { position: absolute; inset: 0; }
        .sol-img > * { width: 100%; height: 100%; }
        .sol-overlay {
          position: absolute; inset: 0; z-index: 1;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: clamp(26px,3vw,42px);
          background: linear-gradient(to top, rgba(10,10,10,.92) 0%, rgba(10,10,10,.55) 38%, rgba(10,10,10,.1) 70%, rgba(10,10,10,0) 100%);
        }
        .sol-tags { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
        .sol-tag { font-size: 11.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.65); }
        .sol-tag--red { color: var(--red); }
        .sol-name { font-family: var(--font-display); font-weight: 900; font-size: clamp(30px,3.6vw,46px); letter-spacing: -.025em; text-transform: uppercase; color: #fff; margin: 0 0 14px; line-height: .9; }
        .sol-blurb { font-size: 14.5px; line-height: 1.6; color: var(--on-dark-soft); margin: 0 0 20px; max-width: 42ch; }
        .sol-features { list-style: none; margin: 0 0 24px; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 420px; }
        .sol-features li { display: flex; align-items: center; gap: 10px; font-size: 13.5px; font-weight: 600; color: #fff; }
        .sol-link { font-weight: 700; font-size: 13.5px; letter-spacing: .05em; text-transform: uppercase; color: #fff; display: inline-flex; align-items: center; gap: 10px; }
        @media (max-width: 760px) {
          .sol-grid { grid-template-columns: 1fr !important; }
          .sol-card { min-height: 460px; }
        }
      ` }} />
    </section>
  );
}
