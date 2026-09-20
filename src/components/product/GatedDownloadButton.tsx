'use client';

import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';
import { useState, type ReactNode } from 'react';

import type { LeadFormData, LeadModalResult } from '@/components/sections/LeadGenModal';
import { analytics, setEnhancedConversionsUserData } from '@/lib/analytics';

// Only mounts after a click, so the modal stays out of the initial bundle.
const LeadGenModal = dynamic(() => import('@/components/sections/LeadGenModal'), { ssr: false });

interface GatedDownloadButtonProps {
  slug: string;
  documentId: string;
  label: string;
  icon: ReactNode;
  format: string;
  /** e.g. "Sent to your inbox" */
  hint: string;
}

interface DocumentResponse {
  success?: boolean;
  /** true when the visitor's copy went out through the mail flow */
  emailSent?: boolean;
  /** true when the lead reached the inbox at Re-Sound */
  leadForwarded?: boolean;
  /** the document's URL, only when the e-mail could not be sent */
  file?: string;
  fileName?: string;
  error?: string;
}

/**
 * A document card. Click → lead form → POST /api/document, which e-mails
 * the document to the address given and the lead to Re-Sound → the modal
 * confirms where the document went. When the mail flow is down the route
 * hands back the file URL and the modal offers a direct download instead,
 * so a visitor never leaves empty-handed.
 */
export default function GatedDownloadButton({ slug, documentId, label, icon, format, hint }: GatedDownloadButtonProps) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<LeadModalResult | null>(null);

  const close = () => {
    setOpen(false);
    setResult(null);
  };

  const handleSubmit = async (data: LeadFormData) => {
    setSubmitting(true);
    setResult(null);
    try {
      const response = await fetch('/api/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, slug, documentId, locale }),
      });
      let body: DocumentResponse = {};
      try {
        body = (await response.json()) as DocumentResponse;
      } catch {
        body = {};
      }
      if (!response.ok || !body.success) {
        setResult({ status: 'error' });
        return;
      }

      try {
        await setEnhancedConversionsUserData(data.email, data.phone);
        if (body.leadForwarded !== false) analytics.generateLead({ product: slug, source: 'document_request' });
        analytics.documentRequested(slug, documentId, body.emailSent ? 'email' : 'download');
      } catch (err) {
        console.warn('Analytics dispatch failed:', err);
      }
      try {
        const w = window as unknown as { clarity?: (...a: unknown[]) => void };
        if (typeof w.clarity === 'function') {
          w.clarity('set', 'lead_status', 'submitted');
          w.clarity('set', 'lead_product', slug);
          if (data.companyName) w.clarity('set', 'company', data.companyName);
          if (data.email) w.clarity('identify', data.email);
          w.clarity('upgrade', 'submitted_lead');
        }
      } catch {
        /* Clarity may not be loaded */
      }

      setResult(
        body.emailSent
          ? { status: 'sent', email: data.email }
          : { status: 'fallback', email: data.email, file: body.file ?? null, fileName: body.fileName ?? null }
      );
    } catch (error) {
      console.error('Error requesting document:', error);
      setResult({ status: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" className="ps-download-card ps-download-gated" onClick={() => setOpen(true)}>
        <span className="ps-download-icon" aria-hidden="true">{icon}</span>
        <span className="ps-download-info">
          <span className="ps-download-label">{label}</span>
          <span className="ps-download-meta">{format} · {hint}</span>
        </span>
        <span className="ps-download-arrow" aria-hidden="true">→</span>
      </button>
      {open && (
        <LeadGenModal
          isOpen={open}
          onClose={close}
          onSubmit={handleSubmit}
          documentLabel={label}
          isSubmitting={submitting}
          result={result}
        />
      )}
    </>
  );
}
