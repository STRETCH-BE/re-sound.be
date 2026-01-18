"use client";

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  children,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClass = `btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`;

  const content = (
    <>
      {loading && (
        <span className="btn-spinner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        </span>
      )}
      {icon && iconPosition === 'left' && !loading && <span className="btn-icon">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && !loading && <span className="btn-icon">{icon}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  return (
    <button className={baseClass} disabled={disabled || loading} {...props}>
      {content}
      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          border-radius: 50px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: var(--brand-blue);
          color: white;
          border-color: var(--brand-blue);
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--brand-blue-dark);
          border-color: var(--brand-blue-dark);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(25, 127, 199, 0.3);
        }

        .btn-secondary {
          background: transparent;
          color: var(--brand-blue);
          border-color: var(--brand-blue);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--brand-blue);
          color: white;
        }

        .btn-ghost {
          background: transparent;
          color: var(--deep-blue);
          border-color: transparent;
        }

        .btn-ghost:hover:not(:disabled) {
          background: var(--cream);
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        .btn-md {
          padding: 0.8rem 1.8rem;
          font-size: 0.95rem;
        }

        .btn-lg {
          padding: 1rem 2.5rem;
          font-size: 1rem;
        }

        .btn-full {
          width: 100%;
        }

        .btn-icon {
          display: flex;
          align-items: center;
        }

        .btn-icon :global(svg) {
          width: 18px;
          height: 18px;
        }

        .btn-spinner {
          display: flex;
          animation: spin 1s linear infinite;
        }

        .btn-spinner :global(svg) {
          width: 18px;
          height: 18px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
