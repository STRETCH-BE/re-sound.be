'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import type { LeadFormData } from '@/components/sections/LeadGenModal';
import { analytics, setEnhancedConversionsUserData } from '@/lib/analytics';

// Only mounts after a click, so the modal stays out of the initial bundle.
const LeadGenModal = dynamic(() => import('@/components/sections/LeadGenModal'), { ssr: false });

interface GatedDownloadButtonProps {
  slug: string;
  file: string;
  label: string;
  icon: string;
  format: string;
  /** e.g. "Available on request" */
  hint: string;
}

/**
 * Lead-gated download (BIM / DWG only). PDFs are plain links — see
 * ProductDownloads. This is the one piece of the downloads block that still
 * needs client JavaScript, and it hydrates as a tiny island.
 */
export default function GatedDownloadButton({ slug, file, label, icon, format, hint }: GatedDownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: LeadFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          downloadedFile: file.split('/').pop(),
          source: `${slug} Product Page`,
        }),
      });

      if (!response.ok) {
        alert('Something went wrong. Please try again.');
        return;
      }

      setOpen(false);
      try {
        await setEnhancedConversionsUserData(data.email, data.phone);
        analytics.generateLead({ product: slug, source: 'gated_download_modal' });
        analytics.fileDownload(slug, file.split('/').pop() || '');
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

      const link = document.createElement('a');
      link.href = file;
      link.download = file.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('Something went wrong. Please try again.');
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
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
          downloadFile={file}
          isSubmitting={submitting}
        />
      )}
    </>
  );
}
