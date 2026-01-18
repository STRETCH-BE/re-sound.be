"use client";

import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'accent';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {icon && <span className="badge-icon">{icon}</span>}
      {children}

      <style jsx>{`
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 600;
          border-radius: 50px;
          white-space: nowrap;
        }

        .badge-sm {
          padding: 0.3rem 0.75rem;
          font-size: 0.75rem;
        }

        .badge-md {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        .badge-default {
          background: var(--cream);
          color: var(--charcoal);
          border: 1px solid var(--sand);
        }

        .badge-primary {
          background: var(--brand-blue-pale);
          color: var(--brand-blue);
          border: 1px solid var(--brand-blue-light);
        }

        .badge-success {
          background: #e6f7f0;
          color: #059669;
          border: 1px solid #34d399;
        }

        .badge-warning {
          background: #fef3c7;
          color: #d97706;
          border: 1px solid #fbbf24;
        }

        .badge-accent {
          background: rgba(45, 189, 168, 0.1);
          color: var(--accent);
          border: 1px solid var(--accent);
        }

        .badge-icon {
          display: flex;
          align-items: center;
        }

        .badge-icon :global(svg) {
          width: 14px;
          height: 14px;
        }
      `}</style>
    </span>
  );
}
