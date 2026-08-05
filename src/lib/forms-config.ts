// ============================================================================
// FORM CONFIGS — the 7 CtaModal types (quote/survey/training/dates/partner/
// call/samples). Mirrors the CtaModal mockup field-for-field. English copy is
// authored here directly for the EN-only launch; extract to messages/ when
// nl/fr/de are added (flagged in CHANGES.md).
// ============================================================================

export type ModalType =
  | 'quote'
  | 'survey'
  | 'training'
  | 'dates'
  | 'partner'
  | 'call'
  | 'samples'
  | 'datasheet';

export type FieldKind = 'text' | 'select' | 'area';

export type FormField = {
  /** Stable key submitted to the API + used as the email label. */
  name: string;
  kind: FieldKind;
  label: string;
  inputType?: 'text' | 'email' | 'tel';
  placeholder?: string;
  options?: string[];
  /** Span both grid columns. */
  full?: boolean;
  required?: boolean;
};

export type ModalConfig = {
  title: string;
  subtitle: string;
  submitLabel: string;
  sentTitle: string;
  sentMsg: string;
  showDates?: boolean;
  fields: FormField[];
};

export const TRAINING_DATES = [
  '15–16 Sep 2026',
  '06–08 Oct 2026',
  '17–18 Nov 2026',
  'Custom on-site session',
];

export const TRAINING_DATE_DETAIL: { date: string; note: string }[] = [
  { date: '15–16 Sep 2026', note: 'Beveren-Waas · 4 seats' },
  { date: '06–08 Oct 2026', note: 'Beveren-Waas · 6 seats' },
  { date: '17–18 Nov 2026', note: 'Beveren-Waas · 8 seats' },
];

export const MODAL_CONFIGS: Record<ModalType, ModalConfig> = {
  quote: {
    title: 'Request a free quote',
    subtitle: 'Tell us about your project and we will get back to you with a tailored price.',
    submitLabel: 'Send request',
    sentTitle: 'Request received',
    sentMsg: 'Thanks — a specialist will reply within two working days.',
    fields: [
      { name: 'name', kind: 'text', inputType: 'text', label: 'Name', placeholder: 'First & last name', required: true },
      { name: 'email', kind: 'text', inputType: 'email', label: 'Email', placeholder: 'you@email.com', required: true },
      { name: 'phone', kind: 'text', inputType: 'tel', label: 'Phone', placeholder: '+32 ...', required: true },
      { name: 'rooms', kind: 'select', label: 'Rooms', options: ['1 room', '2 rooms', '3 rooms', '4 rooms', 'More than 4'] },
      { name: 'timeline', kind: 'select', label: 'Timeline', options: ['As soon as possible', 'Within 1–3 months', 'Within 4–12 months', 'Just exploring'] },
      { name: 'message', kind: 'area', label: 'Your project', placeholder: 'Surface, location, anything useful...', full: true },
    ],
  },
  survey: {
    title: 'Book a site survey',
    subtitle: 'We measure up and advise on site — free and without obligation.',
    submitLabel: 'Request survey',
    sentTitle: 'Survey requested',
    sentMsg: 'Thanks — we will contact you to arrange a convenient time.',
    fields: [
      { name: 'name', kind: 'text', inputType: 'text', label: 'Name', placeholder: 'First & last name', required: true },
      { name: 'email', kind: 'text', inputType: 'email', label: 'Email', placeholder: 'you@email.com', required: true },
      { name: 'phone', kind: 'text', inputType: 'tel', label: 'Phone', placeholder: '+32 ...', required: true },
      { name: 'address', kind: 'text', inputType: 'text', label: 'Address', placeholder: 'Street, city', full: true },
      { name: 'preferredTime', kind: 'select', label: 'Preferred time', options: ['Morning', 'Afternoon', 'Flexible'] },
      { name: 'rooms', kind: 'select', label: 'Rooms', options: ['1 room', '2 rooms', '3 rooms', '4+ rooms'] },
    ],
  },
  training: {
    title: 'Book your training',
    subtitle: 'Hands-on certification at our Belgian HQ — leave your details and we will confirm.',
    submitLabel: 'Request my seat',
    sentTitle: 'Seat requested',
    sentMsg: 'Thanks — we will confirm your spot and send joining details.',
    fields: [
      { name: 'fullName', kind: 'text', inputType: 'text', label: 'Full name', placeholder: 'First & last name', required: true },
      { name: 'company', kind: 'text', inputType: 'text', label: 'Company', placeholder: 'Your company' },
      { name: 'email', kind: 'text', inputType: 'email', label: 'Email', placeholder: 'you@company.com', required: true },
      { name: 'phone', kind: 'text', inputType: 'tel', label: 'Phone', placeholder: '+32 ...', required: true },
      { name: 'preferredDate', kind: 'select', label: 'Preferred date', options: TRAINING_DATES },
      { name: 'attendees', kind: 'select', label: 'Attendees', options: ['1 person', '2 people', '3 people', '4+ people'] },
    ],
  },
  dates: {
    title: 'Upcoming training dates',
    subtitle: 'Pick a date and reserve your seat — small groups, booked first-come.',
    submitLabel: 'Request my seat',
    sentTitle: 'Seat requested',
    sentMsg: 'Thanks — we will confirm your spot and send joining details.',
    showDates: true,
    fields: [
      { name: 'fullName', kind: 'text', inputType: 'text', label: 'Full name', placeholder: 'First & last name', required: true },
      { name: 'email', kind: 'text', inputType: 'email', label: 'Email', placeholder: 'you@company.com', required: true },
      { name: 'phone', kind: 'text', inputType: 'tel', label: 'Phone', placeholder: '+32 ...', required: true },
      { name: 'preferredDate', kind: 'select', label: 'Preferred date', options: TRAINING_DATES },
    ],
  },
  partner: {
    title: 'Apply to become a partner',
    subtitle: 'Tell us about your company — we review every application personally.',
    submitLabel: 'Submit application',
    sentTitle: 'Application received',
    sentMsg: 'Thanks — our partner team will review and get back to you within two working days.',
    fields: [
      { name: 'company', kind: 'text', inputType: 'text', label: 'Company', placeholder: 'Your company', required: true },
      { name: 'contactName', kind: 'text', inputType: 'text', label: 'Contact name', placeholder: 'First & last name', required: true },
      { name: 'partnerType', kind: 'select', label: 'I want to become a', options: ['Reseller — I sell, you install', 'Dealer — I sell & install myself', 'Not sure yet'] },
      { name: 'email', kind: 'text', inputType: 'email', label: 'Email', placeholder: 'you@company.com', required: true },
      { name: 'phone', kind: 'text', inputType: 'tel', label: 'Phone', placeholder: '+32 ...', required: true },
      { name: 'country', kind: 'text', inputType: 'text', label: 'Country', placeholder: 'Belgium' },
      { name: 'activity', kind: 'select', label: 'Activity', options: ['Building & renovation', 'Interior fit-out', 'Dry-lining / plastering', 'Electrical / lighting', 'Other'] },
      { name: 'notes', kind: 'area', label: 'About your business', placeholder: 'Team size, regions you cover, current activity...', full: true },
    ],
  },
  call: {
    title: 'Book a call',
    subtitle: 'Leave your number and a good time — we will call you back.',
    submitLabel: 'Request a call',
    sentTitle: 'Call requested',
    sentMsg: 'Thanks — we will call you at your preferred time.',
    fields: [
      { name: 'name', kind: 'text', inputType: 'text', label: 'Name', placeholder: 'First & last name', required: true },
      { name: 'phone', kind: 'text', inputType: 'tel', label: 'Phone', placeholder: '+32 ...', required: true },
      { name: 'bestTime', kind: 'select', label: 'Best time', options: ['Morning', 'Afternoon', 'Early evening'] },
      { name: 'topic', kind: 'select', label: 'Topic', options: ['A quote', 'Partnership', 'Training', 'Technical question', 'Other'] },
    ],
  },
  samples: {
    title: 'Request colour samples',
    subtitle: 'Order physical RAL / colour swatches — free for trade partners.',
    submitLabel: 'Request samples',
    sentTitle: 'Samples requested',
    sentMsg: 'Thanks — we will post your swatches and follow up within two working days.',
    fields: [
      { name: 'company', kind: 'text', inputType: 'text', label: 'Company', placeholder: 'Your company', required: true },
      { name: 'contactName', kind: 'text', inputType: 'text', label: 'Contact name', placeholder: 'First & last name', required: true },
      { name: 'email', kind: 'text', inputType: 'email', label: 'Email', placeholder: 'you@company.com', required: true },
      { name: 'phone', kind: 'text', inputType: 'tel', label: 'Phone', placeholder: '+32 ...', required: true },
      { name: 'shippingAddress', kind: 'text', inputType: 'text', label: 'Shipping address', placeholder: 'Street, postcode, city', full: true },
      { name: 'productLine', kind: 'select', label: 'Product line', options: ['Polyester', 'PVC film', 'Acoustic', 'Not sure yet'] },
      { name: 'colours', kind: 'text', inputType: 'text', label: 'Colours of interest', placeholder: 'e.g. White, Anthracite, Custom RAL' },
      { name: 'notes', kind: 'area', label: 'Notes', placeholder: 'Project, quantities, anything useful...', full: true },
    ],
  },
  datasheet: {
    title: 'Download the datasheet',
    subtitle: 'Enter your details and the download will start straight away. We only use them to follow up on your enquiry.',
    submitLabel: 'Get the datasheet',
    sentTitle: 'Here is your datasheet',
    sentMsg: 'Your download should start automatically — if it does not, use the button below.',
    fields: [
      { name: 'name', kind: 'text', inputType: 'text', label: 'Name', placeholder: 'First & last name', required: true, full: true },
      { name: 'email', kind: 'text', inputType: 'email', label: 'Email', placeholder: 'you@email.com', required: true },
      { name: 'phone', kind: 'text', inputType: 'tel', label: 'Phone', placeholder: '+32 ...', required: true },
    ],
  },
};
