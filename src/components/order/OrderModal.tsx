'use client';

import { cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

import { analytics } from '@/lib/analytics';
import { getOrderable, type OrderOption } from '@/lib/order/catalogue';
import { formatCents, priceOrder, type OrderSelection } from '@/lib/order/pricing';
import { COUNTRIES, isVatNumberFormatValid, splitVatNumber, isEuCountry, SHIP_FROM_COUNTRY } from '@/lib/order/vat';

/**
 * Order dialog: configure → your details → review → confirmation.
 *
 * Prices shown here are the same functions the API route runs again on the
 * submitted order, so the buyer sees what Re-Sound will invoice. Nothing is
 * paid online: the order is confirmed by Re-Sound, who add transport, which
 * is never part of the listed price.
 */

interface Props {
  open: boolean;
  onClose: () => void;
  /** Product slug — has to be in the order catalogue */
  slug: string;
  /** Product name as shown on the page */
  productName: string;
  /** Translation namespace of the product page, for the add-on labels */
  namespace: string;
  /** Routing locale */
  locale: string;
  /** BCP 47 tag for currency and country names */
  localeTag: string;
}

type Step = 'configure' | 'details' | 'review' | 'done';
const STEP_ORDER: Step[] = ['configure', 'details', 'review'];

interface CustomerForm {
  type: 'company' | 'private';
  companyName: string;
  vatNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  notes: string;
}

const EMPTY_CUSTOMER: CustomerForm = {
  type: 'company',
  companyName: '',
  vatNumber: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  postalCode: '',
  city: '',
  country: 'BE',
  notes: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function OrderModal({ open, onClose, slug, productName, namespace, locale, localeTag }: Props) {
  const t = useTranslations('order');
  const tProduct = useTranslations(namespace);
  const tFooter = useTranslations('footer');
  /** Error codes from the API; an unknown code falls back to the generic line. */
  const tError = (code: string): string => {
    const known = [
      'rate_limited', 'invalid_product', 'invalid_country', 'invalid_details',
      'company_required', 'consent_required', 'pricing_failed', 'not_delivered', 'server_error',
    ];
    return known.includes(code) ? t(`error.${code}` as 'error.generic') : t('error.generic');
  };

  const product = getOrderable(slug);
  const [step, setStep] = useState<Step>('configure');
  const [quantity, setQuantity] = useState(1);
  // The field keeps its own text so clearing it leaves an empty box instead of
  // snapping back to 1, which turned "clear, type 2" into 12.
  const [quantityText, setQuantityText] = useState('1');
  const [options, setOptions] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState<CustomerForm>(EMPTY_CUSTOMER);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<{ reference: string; emailSent: boolean; correctedTotal: string | null } | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  /** VIES answer for the typed VAT number; only 'valid' grants the reverse charge. */
  const [vatStatus, setVatStatus] = useState<
    'idle' | 'checking' | 'valid' | 'invalid' | 'unverified' | 'format_invalid' | 'not_eligible'
  >('idle');
  const [vatCountry, setVatCountry] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  // Kept in refs so the dialog effect below binds once per open: an inline
  // `onClose` prop would otherwise tear down and rebuild the listener (and
  // steal focus) on every parent render.
  const closeRef = useRef(onClose);
  const statusRef = useRef(status);
  closeRef.current = onClose;
  statusRef.current = status;
  // The dialog is portalled to <body>: product heroes create their own
  // stacking contexts, which would otherwise trap it under the cookie banner.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ---- dialog behaviour: escape, focus trap, body scroll -------------------
  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      // Never abandon an order that is already on its way to the server:
      // the request would still complete but the buyer would lose the
      // reference and the delivery warning.
      if (e.key === 'Escape' && statusRef.current !== 'sending') closeRef.current();
      if (e.key !== 'Tab') return;
      const all = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const focusable = Array.from(all ?? []).filter(
        (el) => el.tabIndex >= 0 && el.getAttribute('aria-hidden') !== 'true' && el.offsetParent !== null
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (active && !dialogRef.current?.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus?.();
    };
  }, [open]);

  // Reset when the dialog is opened again after a finished order.
  useEffect(() => {
    if (!open) return;
    setStatus('idle');
    setErrorMessage('');
    if (result) {
      setStep('configure');
      setQuantity(1);
      setQuantityText('1');
      setOptions({});
      setConsent(false);
      setResult(null);
    }
    // `result` intentionally read only when the dialog re-opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Move focus to the new step once it has rendered, so a screen reader
  // announces the change instead of leaving the user on a button that is gone.
  useEffect(() => {
    if (!open) return;
    const target = dialogRef.current?.querySelector<HTMLElement>('.om-done, .om-section-title');
    target?.focus();
  }, [step, open]);

  const selection: OrderSelection = useMemo(() => ({ slug, quantity, options }), [slug, quantity, options]);

  const vatNumberFormatValid = customer.vatNumber.trim().length > 0 && isVatNumberFormatValid(customer.vatNumber);
  const vatNumberCountry = customer.vatNumber ? splitVatNumber(customer.vatNumber)?.country ?? null : null;
  // The server zero-rates only what VIES confirms, so the dialog does the same:
  // the buyer never consents to a total the invoice will not match.
  const vatNumberVerified = vatStatus === 'valid';

  const priced = useMemo(
    () =>
      priceOrder(selection, {
        customerType: customer.type,
        deliveryCountry: customer.country,
        vatNumberValid: vatNumberVerified,
        vatNumberCountry: vatCountry ?? vatNumberCountry,
      }),
    [selection, customer.type, customer.country, vatNumberVerified, vatCountry, vatNumberCountry]
  );

  // Ask the server (and through it VIES) about the number the buyer typed.
  const checkVat = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setVatStatus('idle');
      setVatCountry(null);
      return;
    }
    if (!isVatNumberFormatValid(trimmed)) {
      setVatStatus('format_invalid');
      setVatCountry(null);
      return;
    }
    setVatStatus('checking');
    try {
      const response = await fetch('/api/vat-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vatNumber: trimmed }),
      });
      const data = (await response.json()) as { status?: string; country?: string | null };
      const next = data.status ?? 'unverified';
      setVatStatus(
        next === 'valid' || next === 'invalid' || next === 'not_eligible' || next === 'format_invalid'
          ? (next as 'valid')
          : 'unverified'
      );
      setVatCountry(data.country ?? null);
    } catch {
      setVatStatus('unverified');
    }
  };

  const countryLabel = useMemo(() => {
    let display: Intl.DisplayNames | null = null;
    try {
      display = new Intl.DisplayNames([locale], { type: 'region' });
    } catch {
      display = null;
    }
    return (code: string, fallback: string) => {
      if (code === 'OTHER') return t('details.otherCountry');
      try {
        return display?.of(code) ?? fallback;
      } catch {
        return fallback;
      }
    };
  }, [locale, t]);

  const countryOptions = useMemo(
    () =>
      COUNTRIES.map((c) => ({ code: c.code, label: countryLabel(c.code, c.name) })).sort((a, b) =>
        a.code === 'OTHER' ? 1 : b.code === 'OTHER' ? -1 : a.label.localeCompare(b.label, locale)
      ),
    [countryLabel, locale]
  );

  if (!open || !mounted || !product || !priced) return null;

  const optionLabel = (option: OrderOption): string =>
    option.labelFrom === 'order' ? t(`options.${option.id}.label`) : tProduct(`addons.${option.id}.title`);

  const optionDescription = (option: OrderOption): string | null => {
    if (option.labelFrom === 'order') return option.hasNote ? t(`options.${option.id}.note`) : null;
    return tProduct.has(`addons.${option.id}.desc`) ? tProduct(`addons.${option.id}.desc`) : null;
  };

  const optionPriceLabel = (option: OrderOption): string => {
    if (option.priceExclVat === null) return t('summary.onRequest');
    // A per-booth option is charged once per booth, so show what it actually
    // adds to this order rather than the price of one.
    const cents = Math.round(option.priceExclVat * 100) * (option.perUnit ? quantity : 1);
    return t('configure.optionPrice', { price: formatCents(cents, localeTag) });
  };

  const money = (cents: number) => formatCents(cents, localeTag);

  const vatHint =
    vatStatus === 'checking'
      ? t('details.vatChecking')
      : vatStatus === 'valid'
        ? priced.vatMode === 'reverse-charge'
          ? t('details.vatVerified')
          : priced.vatMode === 'export'
            ? t('vat.exportNote')
            : t('vat.polandNote')
        : vatStatus === 'invalid'
          ? t('details.vatRejected')
          : vatStatus === 'unverified'
            ? t('details.vatUnverified')
            : vatStatus === 'not_eligible'
              ? t('details.vatNotEligible')
              : vatStatus === 'format_invalid'
                ? t('details.vatInvalid')
                : t('details.vatHint');

  const vatLabel =
    priced.vatMode === 'reverse-charge'
      ? t('vat.reverseCharge')
      : priced.vatMode === 'export'
        ? t('vat.export')
        : t('vat.domestic', { rate: Math.round(priced.vatRate * 100) });

  const detailFields: Array<{ id: string; label: string; ok: boolean }> = [
    ...(customer.type === 'company'
      ? [{ id: 'order-company', label: t('details.companyName'), ok: customer.companyName.trim().length > 0 }]
      : []),
    { id: 'order-first', label: t('details.firstName'), ok: customer.firstName.trim().length > 0 },
    { id: 'order-last', label: t('details.lastName'), ok: customer.lastName.trim().length > 0 },
    { id: 'order-email', label: t('details.email'), ok: EMAIL_RE.test(customer.email.trim()) },
    { id: 'order-street', label: t('details.street'), ok: customer.street.trim().length > 0 },
    { id: 'order-postal', label: t('details.postalCode'), ok: customer.postalCode.trim().length > 0 },
    { id: 'order-city', label: t('details.city'), ok: customer.city.trim().length > 0 },
  ];
  const detailsValid = detailFields.every((f) => f.ok);

  const set = <K extends keyof CustomerForm>(field: K, value: CustomerForm[K]) =>
    setCustomer((current) => ({ ...current, [field]: value }));

  const setOption = (id: string, value: number) =>
    setOptions((current) => {
      const next = { ...current };
      if (value <= 0) delete next[id];
      else next[id] = value;
      return next;
    });

  const goTo = (next: Step) => {
    setStep(next);
    setMissing([]);
    dialogRef.current?.scrollTo?.({ top: 0 });
  };

  /** Step 2 → 3: advance, or name the fields that are still empty. */
  const continueFromDetails = () => {
    const gaps = detailFields.filter((f) => !f.ok);
    if (gaps.length === 0) {
      goTo('review');
      return;
    }
    setMissing(gaps.map((f) => f.label));
    const first = gaps[0];
    dialogRef.current?.querySelector<HTMLElement>(`#${first.id}`)?.focus();
  };

  // Arrow function: keeps the non-null narrowing of `priced` from the guard above.
  const submit = async () => {
    setStatus('sending');
    setErrorMessage('');
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, selection, customer, consent, website: honeypot }),
      });
      const data = (await response.json()) as {
        reference?: string;
        confirmationSent?: boolean;
        error?: string;
        totals?: { grossCents: number; vatMode: string };
      };
      if (!response.ok || !data.reference || data.error) {
        setStatus('error');
        // The route answers with a code; anything unknown falls back to the
        // generic message so the buyer never sees a raw English literal.
        const code = data.error ?? '';
        setErrorMessage(code ? tError(code) : t('error.generic'));
        return;
      }
      // The server is the authority on the amount. If it differs from what the
      // buyer just agreed to (an unverified VAT number, say), show the real one.
      const serverGross = data.totals?.grossCents;
      const corrected =
        typeof serverGross === 'number' && serverGross !== priced.grossCents ? money(serverGross) : null;
      analytics.orderSubmitted({
        product: slug,
        quantity,
        vatMode: data.totals?.vatMode ?? priced.vatMode,
        valueCents: serverGross ?? priced.grossCents,
      });
      setResult({ reference: data.reference, emailSent: data.confirmationSent !== false, correctedTotal: corrected });
      setStatus('idle');
      goTo('done');
    } catch {
      setStatus('error');
      setErrorMessage(t('error.network'));
    }
  };

  const stepIndex = STEP_ORDER.indexOf(step);
  // Never abandon an order that is already on its way to the server: the
  // request completes either way, but the buyer would lose their reference.
  const requestClose = () => {
    if (status !== 'sending') onClose();
  };

  return createPortal(
    <div className="om-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && requestClose()}>
      <div
        ref={dialogRef}
        className="om-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        <header className="om-header">
          <div>
            <p className="om-eyebrow">{step === 'done' ? t('success.eyebrow') : t('step', { current: stepIndex + 1, total: STEP_ORDER.length })}</p>
            <h2 id="order-modal-title">{step === 'done' ? t('success.title') : t('title', { product: productName })}</h2>
          </div>
          <button type="button" className="om-close" onClick={requestClose} aria-disabled={status === 'sending'} aria-label={t('close')}>
            ×
          </button>
        </header>

        {step !== 'done' && (
          <ol className="om-steps" aria-label={t('stepsLabel')}>
            {STEP_ORDER.map((s, i) => (
              <li key={s} className={i === stepIndex ? 'current' : i < stepIndex ? 'done' : ''} aria-current={i === stepIndex ? 'step' : undefined}>
                <span className="om-step-no" aria-hidden="true">{i < stepIndex ? '✓' : i + 1}</span>
                {t(`steps.${s}`)}
              </li>
            ))}
          </ol>
        )}

        {/* Honeypot: never shown, never focusable. The route drops any order
            that fills it in. */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="om-sr-only"
        />

        <div className="om-body">
          {/* ── Step 1: configuration ─────────────────────────────── */}
          {step === 'configure' && (
            <>
              <h3 className="om-section-title" tabIndex={-1}>{t('configure.title')}</h3>

              <div className="om-qty">
                <label htmlFor="order-qty">{t('configure.quantity')}</label>
                <div className="om-qty-controls">
                  <button type="button" onClick={() => { const next = Math.max(1, quantity - 1); setQuantity(next); setQuantityText(String(next)); }} aria-label={t('configure.decrease')}>
                    −
                  </button>
                  <input
                    id="order-qty"
                    type="number"
                    min={1}
                    max={product.maxQty}
                    value={quantityText}
                    onChange={(e) => {
                      const text = e.target.value;
                      setQuantityText(text);
                      const parsed = Number(text);
                      if (text.trim() !== '' && Number.isFinite(parsed)) {
                        setQuantity(Math.min(product.maxQty, Math.max(1, Math.floor(parsed))));
                      }
                    }}
                    onBlur={() => setQuantityText(String(quantity))}
                  />
                  <button type="button" onClick={() => { const next = Math.min(product.maxQty, quantity + 1); setQuantity(next); setQuantityText(String(next)); }} aria-label={t('configure.increase')}>
                    +
                  </button>
                </div>
                <span className="om-qty-unit">
                  {t(`units.${product.unitKey}`)} · {money(product.unitPriceExclVat * 100)}
                </span>
              </div>

              {product.options.length > 0 && (
                <fieldset className="om-options">
                  <legend>{t('configure.optionsTitle')}</legend>
                  {product.options.map((option) => {
                    const description = optionDescription(option);
                    const inputId = `order-option-${option.id}`;
                    return (
                      <div key={option.id} className="om-option">
                        {option.kind === 'toggle' ? (
                          <input
                            id={inputId}
                            type="checkbox"
                            checked={(options[option.id] ?? 0) > 0}
                            onChange={(e) => setOption(option.id, e.target.checked ? 1 : 0)}
                          />
                        ) : (
                          <input
                            id={inputId}
                            className="om-option-qty"
                            type="number"
                            min={0}
                            max={option.maxQty ?? 1}
                            value={options[option.id] ?? 0}
                            onChange={(e) => setOption(option.id, Math.min(option.maxQty ?? 1, Math.max(0, Number(e.target.value) || 0)))}
                          />
                        )}
                        <div className="om-option-text">
                          <label htmlFor={inputId}>
                            {optionLabel(option)} <span className="om-option-price">{optionPriceLabel(option)}</span>
                          </label>
                          {description && <p>{description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </fieldset>
              )}

            </>
          )}

          {/* ── Step 2: customer details ──────────────────────────── */}
          {step === 'details' && (
            <>
              <h3 className="om-section-title" tabIndex={-1}>{t('details.title')}</h3>
              {missing.length > 0 && (
                <div className="om-error" role="alert">
                  <p>{t('review.missingTitle')}</p>
                  <ul>
                    {missing.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                </div>
              )}

              <fieldset className="om-type">
                <legend>{t('details.customerType')}</legend>
                {(['company', 'private'] as const).map((value) => (
                  <label key={value} className={customer.type === value ? 'active' : ''}>
                    <input
                      type="radio"
                      name="customer-type"
                      value={value}
                      checked={customer.type === value}
                      onChange={() => set('type', value)}
                    />
                    {t(`details.${value}`)}
                  </label>
                ))}
              </fieldset>

              {customer.type === 'company' && (
                <div className="om-grid">
                  <Field id="order-company" label={t('details.companyName')} required>
                    <input
                      id="order-company"
                      value={customer.companyName}
                      autoComplete="organization"
                      onChange={(e) => set('companyName', e.target.value)}
                      required
                    />
                  </Field>
                  <Field
                    id="order-vat"
                    label={t('details.vatNumber')}
                    hint={vatHint}
                    live
                    invalid={vatStatus === 'format_invalid' || vatStatus === 'invalid'}
                  >
                    <input
                      id="order-vat"
                      value={customer.vatNumber}
                      placeholder="BE0123456789"
                      onChange={(e) => {
                        set('vatNumber', e.target.value.toUpperCase());
                        setVatStatus('idle');
                      }}
                      onBlur={(e) => checkVat(e.target.value)}
                      aria-invalid={vatStatus === 'format_invalid' || vatStatus === 'invalid'}
                    />
                  </Field>
                </div>
              )}

              <div className="om-grid">
                <Field id="order-first" label={t('details.firstName')} required>
                  <input id="order-first" value={customer.firstName} autoComplete="given-name" onChange={(e) => set('firstName', e.target.value)} required />
                </Field>
                <Field id="order-last" label={t('details.lastName')} required>
                  <input id="order-last" value={customer.lastName} autoComplete="family-name" onChange={(e) => set('lastName', e.target.value)} required />
                </Field>
                <Field id="order-email" label={t('details.email')} required>
                  <input id="order-email" type="email" value={customer.email} autoComplete="email" onChange={(e) => set('email', e.target.value)} required />
                </Field>
                <Field id="order-phone" label={t('details.phone')}>
                  <input id="order-phone" type="tel" value={customer.phone} autoComplete="tel" onChange={(e) => set('phone', e.target.value)} />
                </Field>
              </div>

              <h4 className="om-subtitle">{t('details.addressTitle')}</h4>
              <div className="om-grid">
                <Field id="order-street" label={t('details.street')} required wide>
                  <input id="order-street" value={customer.street} autoComplete="street-address" onChange={(e) => set('street', e.target.value)} required />
                </Field>
                <Field id="order-postal" label={t('details.postalCode')} required>
                  <input id="order-postal" value={customer.postalCode} autoComplete="postal-code" onChange={(e) => set('postalCode', e.target.value)} required />
                </Field>
                <Field id="order-city" label={t('details.city')} required>
                  <input id="order-city" value={customer.city} autoComplete="address-level2" onChange={(e) => set('city', e.target.value)} required />
                </Field>
                <Field id="order-country" label={t('details.country')} required wide>
                  <select id="order-country" value={customer.country} autoComplete="country" onChange={(e) => set('country', e.target.value)}>
                    {countryOptions.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field id="order-notes" label={t('details.notes')} hint={t('details.notesHint')}>
                <textarea id="order-notes" rows={3} value={customer.notes} onChange={(e) => set('notes', e.target.value)} />
              </Field>

              <p className="om-note">{vatExplanation(t, customer, priced.vatMode, vatStatus)}</p>
            </>
          )}

          {/* ── Step 3: review ────────────────────────────────────── */}
          {step === 'review' && (
            <>
              <h3 className="om-section-title" tabIndex={-1}>{t('review.title')}</h3>

              <div className="om-review-block">
                <div className="om-review-head">
                  <h4>{productName}</h4>
                  <button type="button" className="om-link" onClick={() => goTo('configure')}>
                    {t('review.editConfig')}
                  </button>
                </div>
                <ul className="om-review-lines">
                  {priced.lines.map((line) => (
                    <li key={line.id}>
                      <span>
                        {line.quantity}× {line.labelFrom === 'product' ? productName : line.labelFrom === 'order' ? t(`options.${line.id}.label`) : tProduct(`addons.${line.id}.title`)}
                      </span>
                      <span>{line.totalCents === null ? t('summary.onRequest') : money(line.totalCents)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="om-review-block">
                <div className="om-review-head">
                  <h4>{t('review.deliveryTitle')}</h4>
                  <button type="button" className="om-link" onClick={() => goTo('details')}>
                    {t('review.editDetails')}
                  </button>
                </div>
                <p className="om-review-address">
                  {customer.type === 'company' && customer.companyName ? `${customer.companyName}\n` : ''}
                  {customer.firstName} {customer.lastName}
                  {'\n'}
                  {customer.street}
                  {'\n'}
                  {customer.postalCode} {customer.city}
                  {'\n'}
                  {countryLabel(customer.country, customer.country)}
                  {'\n'}
                  {customer.email}
                  {customer.phone ? `\n${customer.phone}` : ''}
                  {customer.vatNumber ? `\n${t('details.vatNumber')}: ${customer.vatNumber}` : ''}
                </p>
              </div>

              <label className="om-consent">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>{t('review.consent')}</span>
              </label>
              <p className="om-legal">
                <Link href="/terms" prefetch={false} target="_blank">
                  {tFooter('terms')}
                </Link>
                {' · '}
                <Link href="/privacy" prefetch={false} target="_blank">
                  {tFooter('privacy')}
                </Link>
              </p>

              {missing.length > 0 && status !== 'error' && (
                <p className="om-error" role="alert">
                  {t('review.missingTitle')}
                </p>
              )}
              {status === 'error' && (
                <p className="om-error" role="alert">
                  {errorMessage}
                </p>
              )}
            </>
          )}

          {/* ── Confirmation ──────────────────────────────────────── */}
          {step === 'done' && result && (
            <div className="om-done" tabIndex={-1}>
              <p className="om-done-icon" aria-hidden="true">
                ✅
              </p>
              <p className="om-done-reference">
                {t('success.referenceLabel')}: <strong>{result.reference}</strong>
              </p>
              <p>{t('success.body')}</p>
              {result.correctedTotal && (
                <p className="om-note om-note--warn">{t('success.correctedTotal', { total: result.correctedTotal })}</p>
              )}
              {!result.emailSent && <p className="om-note om-note--warn">{t('success.emailFallback', { reference: result.reference })}</p>}
              <p className="om-note">{t('summary.transportNote')}</p>
            </div>
          )}
        </div>

        {/* ── Running total + navigation ──────────────────────────── */}
        {step !== 'done' && (
          <footer className="om-footer">
            <div className="om-totals" aria-live="polite" aria-atomic="true">
              <div>
                <span>{t('summary.net')}</span>
                <span>{money(priced.netCents)}</span>
              </div>
              <div>
                <span>{vatLabel}</span>
                <span>{money(priced.vatCents)}</span>
              </div>
              <div className="om-total">
                <span>{t('summary.total')}</span>
                <span>{money(priced.grossCents)}</span>
              </div>
              <p className="om-totals-note">{t('summary.transportNote')}</p>
              {priced.hasOnRequestItems && <p className="om-totals-note om-totals-note--warn">{t('summary.onRequestNote')}</p>}
            </div>

            <p className="om-sr-only" role="status">{status === 'sending' ? t('review.submitting') : ''}</p>
            <div className="om-actions">
              {stepIndex > 0 && (
                <button type="button" className="om-btn om-btn--ghost" onClick={() => goTo(STEP_ORDER[stepIndex - 1])}>
                  {t('back')}
                </button>
              )}
              {step === 'configure' && (
                <button type="button" className="om-btn om-btn--primary" onClick={() => goTo('details')}>
                  {t('continue')}
                </button>
              )}
              {step === 'details' && (
                <button type="button" className="om-btn om-btn--primary" onClick={continueFromDetails}>
                  {t('continue')}
                </button>
              )}
              {step === 'review' && (
                <button
                  type="button"
                  className="om-btn om-btn--primary"
                  onClick={() => {
                    if (!consent) {
                      setMissing([t('review.consent')]);
                      dialogRef.current?.querySelector<HTMLElement>('.om-consent input')?.focus();
                      return;
                    }
                    if (status !== 'sending') submit();
                  }}
                  aria-disabled={!consent || status === 'sending'}
                >
                  {status === 'sending' ? t('review.submitting') : t('review.submit')}
                </button>
              )}
            </div>
          </footer>
        )}

        {step === 'done' && (
          <footer className="om-footer om-footer--done">
            <button type="button" className="om-btn om-btn--primary" onClick={onClose}>
              {t('success.close')}
            </button>
          </footer>
        )}
      </div>

      <style jsx>{`
        .om-sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        .om-backdrop {
          position: fixed;
          inset: 0;
          /* Above the cookie banner (z-index 1000): the order dialog is modal
             and its footer buttons must never sit under the banner. */
          z-index: 1200;
          background: rgba(13, 58, 92, 0.55);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 3vh 1rem;
          overflow-y: auto;
        }
        .om-dialog {
          background: #fff;
          border-radius: 18px;
          width: min(720px, 100%);
          max-height: 94vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
        }
        .om-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.5rem 1.75rem 1rem;
          border-bottom: 1px solid #eef2f6;
        }
        .om-eyebrow {
          margin: 0 0 0.3rem;
          font-size: 0.7rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          font-weight: 700;
          /* --brand-blue on white is 4.28:1; the dark token clears AA at this size */
          color: var(--brand-blue-dark, #145f96);
        }
        .om-header h2 {
          margin: 0;
          font-size: 1.35rem;
          font-family: var(--font-heading);
          color: var(--deep-blue, #0d3a5c);
          line-height: 1.25;
        }
        .om-close {
          background: none;
          border: 0;
          font-size: 1.8rem;
          line-height: 1;
          color: #5a6b7f;
          cursor: pointer;
          min-width: 44px;
          min-height: 44px;
        }
        .om-close:hover {
          color: var(--deep-blue, #0d3a5c);
        }
        .om-steps {
          display: flex;
          gap: 0.5rem;
          list-style: none;
          margin: 0;
          padding: 0.9rem 1.75rem;
          background: var(--cream, #f7f9fb);
          font-size: 0.8rem;
          color: #5a6b7f;
          flex-wrap: wrap;
        }
        .om-steps li {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .om-steps li + li::before {
          content: '';
          width: 18px;
          height: 1px;
          background: #cbd5e1;
          margin-right: 0.3rem;
        }
        .om-step-no {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #334155;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .om-steps li.current {
          color: var(--deep-blue, #0d3a5c);
          font-weight: 600;
        }
        .om-steps li.current .om-step-no {
          background: var(--brand-blue-dark, #145f96);
          color: #fff;
        }
        .om-steps li.done .om-step-no {
          background: #b6d9f2;
          color: var(--deep-blue, #0d3a5c);
        }
        .om-body {
          padding: 1.5rem 1.75rem;
          overflow-y: auto;
          flex: 1;
        }
        .om-section-title:focus {
          outline: 2px solid var(--brand-blue-dark, #145f96);
          outline-offset: 4px;
        }
        .om-done:focus {
          outline: none;
        }
        .om-error ul {
          margin: 0.4rem 0 0 1.1rem;
          padding: 0;
        }
        .om-section-title {
          margin: 0 0 1.1rem;
          font-size: 1.05rem;
          font-family: var(--font-heading);
          color: var(--deep-blue, #0d3a5c);
        }
        .om-subtitle {
          margin: 1.4rem 0 0.7rem;
          font-size: 0.78rem;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #64748b;
        }
        .om-qty {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          flex-wrap: wrap;
          padding-bottom: 1.2rem;
          border-bottom: 1px solid #eef2f6;
        }
        .om-qty label {
          font-weight: 600;
          color: var(--deep-blue, #0d3a5c);
          font-size: 0.95rem;
        }
        .om-qty-controls {
          display: flex;
          align-items: center;
          border: 1px solid #6b7d94;
          border-radius: 10px;
          overflow: hidden;
        }
        .om-qty-controls button {
          width: 44px;
          height: 44px;
          border: 0;
          background: #f8fafc;
          font-size: 1.2rem;
          cursor: pointer;
          color: var(--deep-blue, #0d3a5c);
        }
        .om-qty-controls button:hover {
          background: #e8f4fc;
        }
        .om-qty-controls input {
          width: 64px;
          height: 44px;
          border: 0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          text-align: center;
          font-size: 1rem;
          font-weight: 600;
          color: var(--deep-blue, #0d3a5c);
        }
        .om-qty-unit {
          font-size: 0.9rem;
          color: #5a6b7f;
        }
        .om-options {
          border: 0;
          margin: 1.3rem 0 0;
          padding: 0;
        }
        .om-options legend {
          font-size: 0.78rem;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 0.6rem;
          padding: 0;
        }
        .om-option {
          display: flex;
          gap: 0.8rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .om-option input[type='checkbox'] {
          width: 20px;
          height: 20px;
          margin-top: 0.15rem;
          accent-color: var(--brand-blue, #197fc7);
          flex-shrink: 0;
        }
        .om-option-qty {
          width: 62px;
          height: 40px;
          border: 1px solid #6b7d94;
          border-radius: 8px;
          text-align: center;
          flex-shrink: 0;
        }
        .om-option-text label {
          display: block;
          font-size: 0.95rem;
          color: var(--deep-blue, #0d3a5c);
          font-weight: 500;
          cursor: pointer;
        }
        .om-option-price {
          color: var(--brand-blue-dark, #145f96);
          font-weight: 600;
          white-space: nowrap;
        }
        .om-option-text p {
          margin: 0.25rem 0 0;
          font-size: 0.85rem;
          color: #5a6b7f;
          line-height: 1.55;
        }
        .om-note {
          margin: 1.1rem 0 0;
          padding: 0.75rem 0.9rem;
          background: #e8f4fc;
          border-left: 3px solid var(--brand-blue, #197fc7);
          border-radius: 4px;
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--deep-blue, #0d3a5c);
        }
        .om-note--warn {
          background: #fff4e5;
          border-left-color: #e07a4f;
        }
        .om-type {
          border: 0;
          padding: 0;
          margin: 0 0 1.2rem;
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .om-type legend {
          font-size: 0.78rem;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 0.6rem;
          padding: 0;
        }
        .om-type label {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          border: 1px solid #6b7d94;
          border-radius: 50px;
          cursor: pointer;
          font-size: 0.92rem;
          color: var(--deep-blue, #0d3a5c);
        }
        .om-type label.active {
          border-color: var(--brand-blue, #197fc7);
          background: #e8f4fc;
          font-weight: 600;
        }
        .om-type input {
          accent-color: var(--brand-blue, #197fc7);
        }
        .om-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.8rem;
        }
        .om-review-block {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem 1.1rem;
          margin-bottom: 1rem;
        }
        .om-review-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.6rem;
        }
        .om-review-head h4 {
          margin: 0;
          font-size: 1rem;
          color: var(--deep-blue, #0d3a5c);
          font-family: var(--font-heading);
        }
        .om-link {
          background: none;
          border: 0;
          color: var(--brand-blue-dark, #145f96);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          padding: 0.25rem;
        }
        .om-review-lines {
          list-style: none;
          margin: 0;
          padding: 0;
          font-size: 0.92rem;
        }
        .om-review-lines li {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.4rem 0;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        .om-review-lines li:last-child {
          border-bottom: 0;
        }
        .om-review-address {
          margin: 0;
          white-space: pre-line;
          font-size: 0.92rem;
          line-height: 1.65;
          color: #334155;
        }
        .om-consent {
          display: flex;
          gap: 0.7rem;
          align-items: flex-start;
          font-size: 0.88rem;
          line-height: 1.6;
          color: #334155;
          margin-top: 0.4rem;
        }
        .om-consent input {
          width: 20px;
          height: 20px;
          margin-top: 0.1rem;
          accent-color: var(--brand-blue, #197fc7);
          flex-shrink: 0;
        }
        .om-legal {
          margin: 0.6rem 0 0 2.3rem;
          font-size: 0.8rem;
        }
        .om-legal :global(a) {
          color: var(--brand-blue-dark, #145f96);
          text-decoration: underline;
        }
        .om-error {
          margin: 1rem 0 0;
          padding: 0.75rem 0.9rem;
          background: #fdecec;
          border-left: 3px solid #d64545;
          border-radius: 4px;
          color: #8b1f1f;
          font-size: 0.88rem;
        }
        .om-done {
          text-align: center;
          padding: 1rem 0 0.5rem;
        }
        .om-done-icon {
          font-size: 2.6rem;
          margin: 0 0 0.6rem;
        }
        .om-done-reference {
          font-size: 1.05rem;
          color: var(--deep-blue, #0d3a5c);
          margin: 0 0 0.8rem;
        }
        .om-done p {
          color: #475569;
          line-height: 1.7;
        }
        .om-footer {
          border-top: 1px solid #eef2f6;
          padding: 1.1rem 1.75rem 1.4rem;
          background: var(--cream, #f7f9fb);
        }
        .om-footer--done {
          display: flex;
          justify-content: flex-end;
        }
        .om-totals {
          font-size: 0.92rem;
          color: #475569;
          margin-bottom: 0.9rem;
        }
        .om-totals > div {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.15rem 0;
        }
        .om-total {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--deep-blue, #0d3a5c);
          border-top: 1px solid #dbe3ea;
          margin-top: 0.4rem;
          padding-top: 0.5rem !important;
        }
        .om-totals-note {
          margin: 0.5rem 0 0;
          font-size: 0.78rem;
          color: #5a6b7f;
          line-height: 1.5;
        }
        .om-totals-note--warn {
          color: #8a4b00;
          font-weight: 600;
        }
        .om-actions {
          display: flex;
          gap: 0.7rem;
          justify-content: flex-end;
        }
        .om-btn {
          border-radius: 50px;
          padding: 0.85rem 1.8rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          min-height: 44px;
        }
        .om-btn--primary {
          background: var(--brand-blue-dark, #145f96);
          color: #fff;
        }
        .om-btn--primary:hover {
          background: #0f4a76;
        }
        .om-btn--primary[aria-disabled='true'] {
          background: #5c7185;
        }
        .om-btn--ghost {
          background: transparent;
          border-color: #6b7d94;
          color: var(--deep-blue, #0d3a5c);
        }
        @media (max-width: 640px) {
          .om-grid {
            grid-template-columns: 1fr;
          }
          .om-header,
          .om-body,
          .om-footer,
          .om-steps {
            padding-left: 1.1rem;
            padding-right: 1.1rem;
          }
          .om-actions {
            flex-direction: column-reverse;
          }
          .om-btn {
            width: 100%;
          }
        }
      `}</style>
      <style jsx global>{`
        .om-dialog input,
        .om-dialog select,
        .om-dialog textarea {
          font-family: inherit;
          font-size: 0.95rem;
          color: #0f172a;
        }
        .om-dialog .om-field input,
        .om-dialog .om-field select,
        .om-dialog .om-field textarea {
          width: 100%;
          padding: 0.7rem 0.8rem;
          border: 1px solid #6b7d94;
          border-radius: 10px;
          background: #fff;
        }
        .om-dialog .om-field input:focus,
        .om-dialog .om-field select:focus,
        .om-dialog .om-field textarea:focus {
          outline: 2px solid var(--brand-blue, #197fc7);
          outline-offset: 1px;
          border-color: var(--brand-blue, #197fc7);
        }
      `}</style>
    </div>,
    document.body
  );
}

/** Labelled form field with an optional hint line. */
function Field({
  id,
  label,
  hint,
  required,
  invalid,
  wide,
  live,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  invalid?: boolean;
  wide?: boolean;
  /** Announce hint changes: the VIES answer arrives after the field is left. */
  live?: boolean;
  children: React.ReactElement;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  // Tie the hint to the control so it is read out with the field rather than
  // being a paragraph a screen-reader user only meets by chance.
  const control = hintId ? cloneElement(children, { 'aria-describedby': hintId }) : children;
  return (
    <div className="om-field" style={wide ? { gridColumn: '1 / -1' } : undefined}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {control}
      {hint && (
        <p
          id={hintId}
          role={live ? 'status' : undefined}
          aria-live={live ? 'polite' : undefined}
          style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: invalid ? '#b91c1c' : '#5a6b7f', lineHeight: 1.5 }}
        >
          {hint}
        </p>
      )}
      <style jsx>{`
        .om-field {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          margin-bottom: 0.6rem;
        }
        .om-field label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #334155;
        }
      `}</style>
    </div>
  );
}

/** One sentence explaining why this order is or is not charged Polish VAT. */
function vatExplanation(
  t: ReturnType<typeof useTranslations<'order'>>,
  customer: CustomerForm,
  mode: string,
  vatStatus: string
): string {
  if (mode === 'reverse-charge') return t('vat.reverseChargeNote');
  if (mode === 'export') return t('vat.exportNote');
  if (customer.country === SHIP_FROM_COUNTRY) return t('vat.polandNote');
  if (customer.type === 'company' && isEuCountry(customer.country)) {
    if (vatStatus === 'unverified') return t('details.vatUnverified');
    if (vatStatus === 'invalid') return t('details.vatRejected');
    return customer.vatNumber ? t('vat.numberCountryNote') : t('vat.pendingNote');
  }
  return t('vat.privateNote');
}
