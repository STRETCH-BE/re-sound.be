'use client';

// Opens the lead modal in 'datasheet' mode. Once the visitor submits name +
// email + phone, the modal posts the lead to /api/lead and downloads the file.
import { Download } from 'lucide-react';
import { useLeadModal } from '@/components/LeadGenModal';
import type { Datasheet } from '@/lib/datasheets';

export default function DatasheetDownloadButton({
  sheet,
  className = 'btn btn--primary btn--sm',
}: {
  sheet: Datasheet;
  className?: string;
}) {
  const { open } = useLeadModal();
  const filename = sheet.file.split('/').pop() || `${sheet.slug}.pdf`;
  return (
    <button
      type="button"
      className={className}
      onClick={() =>
        open('datasheet', {
          source: 'pdf_download',
          download: { url: sheet.file, filename, label: sheet.title },
        })
      }
    >
      Download <Download size={15} />
    </button>
  );
}
