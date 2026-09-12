'use client';

import { useTranslations } from 'next-intl';

interface MaterialsProps {
  extended?: boolean;
}

export default function Materials({ extended = false }: MaterialsProps) {
  const t = useTranslations('materials');

  // Plain text labels only — no emoji (brief §1.5).
  const materials = [t('jeans'), t('upholstery'), t('clothing'), t('textiles'), t('industrial')];

  const extendedMaterials = [t('bags'), t('wool'), t('mattresses')];

  const allMaterials = extended ? [...materials, ...extendedMaterials] : materials;

  return (
    <section className="materials">
      <div className="materials-inner">
        <span className="section-tag">{t('tag')}</span>
        <h2>{t('title')}</h2>
        <p>{t('subtitle')}</p>

        <div className="materials-grid">
          {allMaterials.map((label, index) => (
            <div key={index} className="material-item">
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
