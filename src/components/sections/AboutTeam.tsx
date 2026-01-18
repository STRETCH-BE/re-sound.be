'use client';

import { useTranslations } from 'next-intl';

export default function AboutTeam() {
  const t = useTranslations('about.team');

  const team = [
    { name: 'Team Member', role: t('roles.founder'), emoji: '👤' },
    { name: 'Team Member', role: t('roles.operations'), emoji: '👤' },
    { name: 'Team Member', role: t('roles.sales'), emoji: '👤' },
  ];

  return (
    <section className="about-team">
      <div className="team-inner">
        <span className="section-tag">{t('tag')}</span>
        <h2>{t('title')}</h2>
        <p className="team-subtitle">{t('subtitle')}</p>

        <div className="team-grid">
          {team.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-photo">
                <span>{member.emoji}</span>
              </div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .about-team {
          padding: 6rem 4rem;
          background: white;
        }

        .team-inner {
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
        }

        .team-inner h2 {
          font-size: 2.5rem;
          color: var(--deep-blue);
          margin: 0.5rem 0 1rem;
        }

        .team-subtitle {
          color: #666;
          font-size: 1.1rem;
          margin-bottom: 3rem;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .team-card {
          text-align: center;
        }

        .team-photo {
          width: 160px;
          height: 160px;
          background: var(--cream);
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
        }

        .team-card h3 {
          font-size: 1.2rem;
          color: var(--deep-blue);
          margin-bottom: 0.25rem;
        }

        .team-card p {
          color: var(--brand-blue);
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .about-team {
            padding: 4rem 1.5rem;
          }

          .team-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 576px) {
          .about-team {
            padding: 3rem 1rem;
          }

          .team-inner h2 {
            font-size: 1.8rem;
          }

          .team-photo {
            width: 120px;
            height: 120px;
            font-size: 3rem;
          }
        }
      `}</style>
    </section>
  );
}
