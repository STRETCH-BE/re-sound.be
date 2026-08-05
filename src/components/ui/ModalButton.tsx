'use client';

// Small client CTA elements that open the lead modal. Lets otherwise-static
// (server) sections include a "Request a quote" button without the whole
// section becoming a client component. `as="link"` renders an <a> styled like a
// text link; default renders a styled button.
import type { ReactNode } from 'react';
import { useLeadModal } from '@/components/LeadGenModal';
import type { ModalType } from '@/lib/forms-config';
import { analytics } from '@/lib/analytics';

type ModalButtonProps = {
  type: ModalType;
  source: string;
  product?: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Fire a quote_click event (for quote CTAs) in addition to opening. */
  trackQuote?: boolean;
};

export function ModalButton({
  type,
  source,
  product,
  children,
  className = 'btn btn--primary',
  style,
  trackQuote,
}: ModalButtonProps) {
  const { open } = useLeadModal();
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => {
        if (trackQuote) analytics.quoteClick(product, source);
        open(type, { source, product });
      }}
    >
      {children}
    </button>
  );
}

export function ModalTextLink({
  type,
  source,
  product,
  children,
  className,
  style,
}: ModalButtonProps) {
  const { open } = useLeadModal();
  return (
    <button
      type="button"
      className={className}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        font: 'inherit',
        color: 'inherit',
        ...style,
      }}
      onClick={() => open(type, { source, product })}
    >
      {children}
    </button>
  );
}
