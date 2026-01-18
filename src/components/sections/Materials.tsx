'use client';

import { useTranslations } from 'next-intl';

interface MaterialsProps {
  extended?: boolean;
}

export default function Materials({ extended = false }: MaterialsProps) {
  const t = useTranslations('materials');

  const materials = [
    { icon: '👖', label: t('jeans') },
    { icon: '🛋️', label: t('upholstery') },
    { icon: '👕', label: t('clothing') },
    { icon: '🧵', label: t('textiles') },
    { icon: '🏭', label: t('industrial') },
  ];

  const extendedMaterials = [
    { icon: '🎒', label: t('bags') },
    { icon: '🧶', label: t('wool') },
    { icon: '🛏️', label: t('mattresses') },
  ];

  const allMaterials = extended ? [...materials, ...extendedMaterials] : materials;

  return (
    <section className="materials">
      <div className="materials-inner">
        <span className="section-tag">{t('tag')}</span>
        <h2>{t('title')}</h2>
        <p>{t('subtitle')}</p>

        <div className="materials-grid">
          {allMaterials.map((material, index) => (
            <div key={index} className="material-item">
              <div className="material-icon">{material.icon}</div>
              <span>{material.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
