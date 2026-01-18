# Re-Sound Lead Generation Popup - Improved Version

An improved, polished lead generation popup for the Re-Sound website. Uses **Power Automate** for email delivery to `leads@stretchgroup.be`.

## 📁 Files to Add to Your Project

```
src/
├── components/
│   ├── LeadGenModal.tsx    ← New file (improved popup)
│   └── index.ts            ← Update exports
└── app/
    └── api/
        └── lead/
            └── route.ts    ← Replace existing file
```

## 🚀 Quick Setup

### Step 1: Replace/Add Files

Copy these files to your existing Re-Sound project:

1. **`src/components/LeadGenModal.tsx`** → Copy to your `src/components/` folder
2. **`src/app/api/lead/route.ts`** → Replace your existing file in `src/app/api/lead/`

### Step 2: Update Component Exports (if needed)

Add to your `src/components/index.ts`:

```typescript
export { default as LeadGenModal } from './LeadGenModal';
export type { LeadFormData } from './LeadGenModal';
```

### Step 3: Use in InteriorProductPage

Your `InteriorProductPage.tsx` should already have the integration. The key parts are:

```tsx
import LeadGenModal, { LeadFormData } from '@/components/LeadGenModal';

// State
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedDownload, setSelectedDownload] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);

// Handler for download button click
const handleDownloadClick = (fileUrl: string) => {
  setSelectedDownload(fileUrl);
  setIsModalOpen(true);
};

// Handler for form submission
const handleLeadSubmit = async (data: LeadFormData) => {
  setIsSubmitting(true);
  try {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        downloadedFile: selectedDownload.split('/').pop(),
        source: 'Interior Product Page',
      }),
    });

    if (response.ok) {
      setIsModalOpen(false);
      // Trigger download
      const link = document.createElement('a');
      link.href = selectedDownload;
      link.download = selectedDownload.split('/').pop() || 'download.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } finally {
    setIsSubmitting(false);
  }
};

// In JSX - Add modal at the end of your component
<LeadGenModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleLeadSubmit}
  downloadFile={selectedDownload}
  isSubmitting={isSubmitting}
/>
```

### Step 4: Environment Variable

Make sure your Vercel project has the Power Automate webhook URL:

```
POWER_AUTOMATE_WEBHOOK_URL=https://prod-xx.westeurope.logic.azure.com/workflows/...
LEADS_EMAIL=leads@stretchgroup.be
```

## 📤 Push to GitHub

```bash
cd ~/path/to/your/resound-project
git add .
git commit -m "Improved lead generation popup design"
git push origin main
```

Vercel will auto-deploy after the push.

## ✨ What's Improved

- **Blue gradient header** matching Re-Sound brand (#197FC7)
- **Shows which file** is being downloaded
- **Better form layout** with proper spacing
- **Smooth animations** on open/close
- **Error validation** with inline messages
- **Mobile responsive** design
- **Accessibility** improvements (keyboard nav, ARIA labels)
- **GDPR consent** checkbox

## 🔧 Customization

### Change Brand Color

Find and replace in `LeadGenModal.tsx`:
```
#197FC7 → Your primary blue
#125a8c → Your darker variant
```

### Modify Dropdown Options

Edit the `companyTypes` and `positionOptions` arrays at the top of `LeadGenModal.tsx`.
