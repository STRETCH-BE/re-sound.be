'use client';

import { useTranslations } from 'next-intl';

export default function ContactInfo() {
  const t = useTranslations('contact.info');

  const contactItems = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: t('email'),
      value: 'info@re-sound.be',
      href: 'mailto:info@re-sound.be',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: t('phone'),
      value: '+32 (0)3 XXX XX XX',
      href: 'tel:+32XXXXXXXXX',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: t('address'),
      value: 'Gentseweg 309 A3\n9120 Beveren-Waas\nBelgium',
      href: 'https://maps.google.com/?q=Gentseweg+309+Beveren-Waas+Belgium',
    },
  ];

  return (
    <div className="contact-info">
      <h3>{t('title')}</h3>
      
      <div className="info-items">
        {contactItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="info-item"
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            <div className="info-icon">{item.icon}</div>
            <div className="info-content">
              <span className="info-label">{item.label}</span>
              <span className="info-value">{item.value}</span>
            </div>
          </a>
        ))}
      </div>

      <div className="business-hours">
        <h4>{t('hours')}</h4>
        <p>{t('hoursValue')}</p>
      </div>

      <style jsx>{`
        .contact-info {
          background: var(--cream);
          padding: 2rem;
          border-radius: 20px;
        }

        .contact-info h3 {
          font-size: 1.3rem;
          color: var(--deep-blue);
          margin-bottom: 1.5rem;
        }

        .info-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .info-item:hover {
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
        }

        .info-icon {
          width: 44px;
          height: 44px;
          background: var(--brand-blue-pale);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-icon :global(svg) {
          width: 22px;
          height: 22px;
          stroke: var(--brand-blue);
        }

        .info-content {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-size: 0.85rem;
          color: #888;
          margin-bottom: 0.25rem;
        }

        .info-value {
          color: var(--deep-blue);
          font-weight: 500;
          white-space: pre-line;
          line-height: 1.5;
        }

        .business-hours {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--sand);
        }

        .business-hours h4 {
          font-size: 0.95rem;
          color: var(--deep-blue);
          margin-bottom: 0.5rem;
        }

        .business-hours p {
          color: #666;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
}
