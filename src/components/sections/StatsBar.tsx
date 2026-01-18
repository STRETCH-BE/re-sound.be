'use client';

import { useTranslations } from 'next-intl';

export default function StatsBar() {
  const t = useTranslations('stats');

  const stats = [
    { number: '100%', label: t('absorption') },
    { number: '50+', label: t('colors') },
    { number: '0', label: t('waste') },
    { number: '🇧🇪', label: t('madeIn') },
  ];

  return (
    <section className="stats-bar">
      {stats.map((stat, index) => (
        <div key={index} className="stat-item">
          <span className="stat-number">{stat.number}</span>
          <span className="stat-label">{stat.label}</span>
        </div>
      ))}
    </section>
  );
}
