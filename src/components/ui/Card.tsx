"use client";

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
}: CardProps) {
  return (
    <div className={`card card-${variant} card-p-${padding} ${hover ? 'card-hover' : ''} ${className}`}>
      {children}

      <style jsx>{`
        .card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .card-default {
          background: var(--cream);
        }

        .card-elevated {
          background: white;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }

        .card-outlined {
          background: white;
          border: 1px solid var(--sand);
        }

        .card-p-none {
          padding: 0;
        }

        .card-p-sm {
          padding: 1rem;
        }

        .card-p-md {
          padding: 1.5rem;
        }

        .card-p-lg {
          padding: 2rem;
        }

        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </div>
  );
}
