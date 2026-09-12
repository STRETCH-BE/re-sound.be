'use client';

import { cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import Icon from '@/components/ui/Icon';

import { analytics } from '@/lib/analytics';
import type { ConfiguratorData } from '@/lib/catalogue/load';
import { categoryLabel, lineLabel } from '@/lib/catalogue/pricing';
import {
  articlesFor,
  canonicalSelection,
  chooseableArticles,
  chooseableCategories,
  defaultSelection,
  POWER_SOCKET_CATEGORY,
  productById,
  socketMatchForCountry,
  TRANSPORT_CATEGORY,
  validateSelection,
  type CatalogueSlice,
} from '@/lib/catalogue/select';
import type { PricedLine, Selection } from '@/lib/catalogue/types';
import {
  COUNTRIES,
  findCountry,
  isVatNumberFormatValid,
  splitVatNumber,
  isEuCountry,
  resolveVat,
  SHIP_FROM_COUNTRY,
  type VatInput,
} from '@/lib/order/vat';

import Configurator from './Configurator';
import { carryOver, money as formatMoney, priceWithVat, withSocketFor } from './configurator';

/**
 * Order dialog: configure → your details → review → confirmation.
 *
 * Step 1 is a configurator driven by the catalogue slice the product page
 * loaded on the server (models, categories, articles). The amounts shown
 * here come from the same pure pricing helpers the API route runs again on
 * the submitted selection, so the buyer sees what Re-Sound will invoice.
 * The page can be up to an hour older than the route's catalogue, so the
 * submit carries the amounts the buyer consented to: when the route prices
 * differently it answers 409 with a fresh slice, the dialog swaps its slice
 * for it and asks the buyer to confirm the new total before anything is
 * stored. Nothing is paid online: the order is confirmed by Re-Sound.
 *
 * Transport and the installation of extra elements are lines the site adds
 * by rule (rule 8 in src/lib/catalogue/types.ts), never choices: the article
 * list is kept in canonical form after every change — model switch, option
 * toggle, delivery country, the fresh slice after a 409 — so the transport
 * line follows the buyer's country (flat rate within mainland Europe, on
 * request for the islands in NON_MAINLAND_EUROPE). Before the country is
 * touched the form is on Belgium, so the mainland line applies.
 */

/**
 * Rule 8 for the dialog's article list: canonicalSelection() drops every
 * auto line and appends the ones the rules give for the product and the
 * delivery country. The quantity plays no part in it.
 */
function canonicalArticles(articles: string[], productId: string, slice: CatalogueSlice, country: string): string[] {
  return canonicalSelection({ productId, quantity: 1, articles }, slice, country).articles;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Product page slug — the websiteSlug of the models in `configurator` */
  slug: string;
  /** Product name as shown on the page (dialog title) */
  productName: string;
  /** Models, categories and articles sold from this page */
  configurator: ConfiguratorData;
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

export default function OrderModal({ open, onClose, slug, productName, configurator, locale, localeTag }: Props) {
  const t = useTranslations('order');
  const tFooter = useTranslations('footer');
  /** Error codes from the API; an unknown code falls back to the generic line. */
  const tError = (code: string): string => {
    const known = [
      'rate_limited', 'invalid_product', 'invalid_country', 'invalid_details',
      'company_required', 'consent_required', 'pricing_failed', 'not_delivered', 'server_error',
      'price_changed', 'selection_outdated',
    ];
    return known.includes(code) ? t(`error.${code}` as 'error.generic') : t('error.generic');
  };

  // The catalogue slice this page sells from: models (one, or Duo Work and
  // Duo Flex), every category, and the articles of those models. State, not
  // the prop: the route hands back a fresher slice when the page's is stale.
  const [slice, setSlice] = useState<CatalogueSlice>(configurator);
  const models = slice.products;
  const byCode = useMemo(() => new Map(slice.articles.map((a) => [a.code, a])), [slice.articles]);

  const [step, setStep] = useState<Step>('configure');
  const [productId, setProductId] = useState(models[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  // defaultSelection() is canonical: the transport line for Belgium (the
  // country the form opens on) is already on it.
  const [articles, setArticles] = useState<string[]>(() => (models[0] ? defaultSelection(models[0], slice).articles : []));
  /** The buyer chose a socket by hand; the delivery country no longer changes it. */
  const [socketTouched, setSocketTouched] = useState(false);
  /** The buyer chose a delivery country (the form opens on Belgium). */
  const [countryTouched, setCountryTouched] = useState(false);
  const [customer, setCustomer] = useState<CustomerForm>(EMPTY_CUSTOMER);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<{
    reference: string;
    emailSent: boolean;
    /** The server's total when it differs from the one the buyer saw, with why */
    corrected: { total: string; reason: 'vat_unverified' | 'vat_verified' | 'price_changed' } | null;
  } | null>(null);
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
      const first = models[0];
      if (first) {
        setProductId(first.id);
        // The details survive a finished order, so the transport line follows
        // the country still on the form rather than Belgium.
        setArticles(canonicalArticles(defaultSelection(first, slice).articles, first.id, slice, customer.country));
      }
      setQuantity(1);
      setSocketTouched(false);
      setCountryTouched(false);
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

  const selection: Selection = useMemo(() => ({ productId, quantity, articles }), [productId, quantity, articles]);

  const vatNumberFormatValid = customer.vatNumber.trim().length > 0 && isVatNumberFormatValid(customer.vatNumber);
  const vatNumberCountry = customer.vatNumber ? splitVatNumber(customer.vatNumber)?.country ?? null : null;
  // The server zero-rates only what VIES confirms, so the dialog does the same:
  // the buyer never consents to a total the invoice will not match.
  const vatNumberVerified = vatStatus === 'valid';

  const vatInput = useMemo<VatInput>(
    () => ({
      customerType: customer.type,
      deliveryCountry: customer.country,
      vatNumberValid: vatNumberVerified,
      vatNumberCountry: vatCountry ?? vatNumberCountry,
    }),
    [customer.type, customer.country, vatNumberVerified, vatCountry, vatNumberCountry]
  );
  const vat = useMemo(() => resolveVat(vatInput), [vatInput]);
  // Catalogue rules for the net, vat.ts for the rate — null only when the
  // selection no longer validates against the slice (never, by construction).
  const priced = useMemo(() => priceWithVat(selection, slice, vatInput), [selection, slice, vatInput]);

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
      // fallback: 'none' → undefined for a code ICU does not know (XI,
      // Northern Ireland) instead of the code echoed back as its own name,
      // so the English name from the country list is used for it.
      display = new Intl.DisplayNames([locale], { type: 'region', fallback: 'none' });
    } catch {
      display = null;
    }
    return (code: string, fallback: string) => {
      if (code === 'OTHER') return t('details.otherCountry');
      try {
        const name = display?.of(code);
        return name && name !== code ? name : fallback;
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

  const product = productById(productId, slice);
  if (!open || !mounted || !product) return null;

  const money = (cents: number) => formatMoney(cents, localeTag);

  // Step 1 shows what the buyer may choose: the auto categories (transport,
  // installation of extra elements) and their articles are left out — the
  // rules add them. The other models' articles stay so the model cards keep
  // their from-price.
  const chooseable: CatalogueSlice = {
    products: slice.products,
    categories: chooseableCategories(product, slice),
    articles: [...chooseableArticles(product, slice), ...slice.articles.filter((a) => a.productId !== product.id)],
  };

  // The booths sold online carry transport as a line, so the note under the
  // totals says what the flat rate covers; a product without transport
  // articles (panels) keeps the older note. The same rule as the e-mails.
  const hasTransportArticles = articlesFor(product.id, slice).some((a) => a.categoryKey === TRANSPORT_CATEGORY);
  const transportNote = t(hasTransportArticles ? 'summary.transportMainlandNote' : 'summary.transportNote');

  /** Amount of one review line: "On request", "Included" for a zero line, else the total. */
  const lineAmount = (line: PricedLine): string =>
    line.lineTotalCents === null
      ? t('summary.onRequest')
      : line.lineTotalCents === 0
        ? t('configure.included')
        : money(line.lineTotalCents);

  /**
   * "2 × €13,781.25" in front of a line total, so the total never reads as a
   * unit price; "2 ×" alone for an included or on-request line; nothing for a
   * single unit.
   */
  const lineQty = (line: PricedLine): string => {
    if (line.qty <= 1) return '';
    return line.unitPriceCents !== null && line.lineTotalCents !== 0 ? `${line.qty} × ${money(line.unitPriceCents)}` : `${line.qty} ×`;
  };

  // The socket the country logic chose (default, or re-matched when the
  // buyer picked a delivery country) — named on the review step. Only a
  // country in the socket map counts as "matched"; anywhere else got the
  // type F default and the note says so.
  const matchedSocket = socketTouched
    ? null
    : articles.map((code) => byCode.get(code)).find((a) => a?.categoryKey === POWER_SOCKET_CATEGORY) ?? null;
  const socketIsMatch = socketMatchForCountry(customer.country) !== null;

  const vatHint =
    vatStatus === 'checking'
      ? t('details.vatChecking')
      : vatStatus === 'valid'
        ? vat.mode === 'reverse-charge'
          ? t('details.vatVerified')
          : vat.mode === 'export'
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
    vat.mode === 'reverse-charge'
      ? t('vat.reverseCharge')
      : vat.mode === 'export'
        ? t('vat.export')
        : t('vat.domestic', { rate: Math.round(vat.rate * 100) });

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

  const set = <K extends keyof CustomerForm>(field: K, value: CustomerForm[K]) =>
    setCustomer((current) => ({ ...current, [field]: value }));

  /**
   * A delivery country also decides the socket: unless the buyer already
   * picked one, the selection follows the country (type E for Belgium and
   * France, G for the UK, Ireland, Malta and Cyprus, J for Switzerland and
   * Liechtenstein, K for Denmark, F for the Schuko countries; Italy gets F
   * as a default and the review step says so).
   */
  const chooseCountry = (code: string) => {
    set('country', code);
    setCountryTouched(true);
    // The socket follows the country unless the buyer picked one; the
    // transport line always does (flat rate on the mainland, on request for
    // the islands).
    setArticles((current) =>
      canonicalArticles(socketTouched ? current : withSocketFor(current, product, slice, code), productId, slice, code)
    );
  };

  /**
   * Another model (Duo Work / Duo Flex): keep every choice the new model
   * also has (colour, felt, table, door, socket, accessories), default the
   * rest — an arrow-key slip on the model radio must not wipe the
   * configuration.
   */
  const chooseModel = (id: string) => {
    const next = productById(id, slice);
    if (!next || next.id === productId) return;
    setProductId(id);
    setArticles((current) =>
      canonicalArticles(carryOver(current, next, slice, countryTouched ? customer.country : undefined), next.id, slice, customer.country)
    );
    setQuantity((q) => Math.min(q, next.maxQty));
  };

  /** A change from step 1: the auto lines are re-derived (installation on → extra-element line). */
  const applySelection = (next: Selection) => {
    setQuantity(next.quantity);
    setArticles(canonicalArticles(next.articles, next.productId, slice, customer.country));
  };

  const goTo = (next: Step) => {
    setStep(next);
    setMissing([]);
    // The body scrolls on desktop; on a phone the whole dialog scrolls
    // inside the backdrop, so reset both.
    dialogRef.current?.scrollTo?.({ top: 0 });
    dialogRef.current?.parentElement?.scrollTo?.({ top: 0 });
  };

  /** Step 1 → 2: advance, or name the category that still needs a choice. */
  const continueFromConfigure = () => {
    const check = validateSelection(selection, slice);
    if (check.ok) {
      goTo('details');
      return;
    }
    const key = check.reason.split(':')[1] ?? '';
    const category = slice.categories.find((c) => c.key === key);
    setMissing([category ? categoryLabel(category, locale) : t('error.pricing_failed')]);
    dialogRef.current?.querySelector<HTMLElement>(key ? `#order-cat-${key} input` : '.om-error')?.focus();
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

  /**
   * The route found the page's slice stale. Take the fresh one; for an
   * outdated selection also repair the configuration (choices that still
   * exist stay, the rest default) and send the buyer back to step 1.
   */
  const adoptFreshSlice = (fresh: CatalogueSlice, repair: boolean) => {
    setSlice(fresh);
    const next = productById(productId, fresh) ?? fresh.products[0];
    if (!next) return;
    if (repair) {
      setProductId(next.id);
      setQuantity((q) => Math.min(q, next.maxQty));
    }
    // Either way the auto lines come from the fresh slice: a transport price
    // may be exactly what changed.
    setArticles((current) =>
      canonicalArticles(
        repair ? carryOver(current, next, fresh, countryTouched ? customer.country : undefined) : current,
        next.id,
        fresh,
        customer.country
      )
    );
  };

  // Arrow function: keeps the non-null narrowing of `product` from the guard above.
  const submit = async () => {
    if (!priced) return;
    setStatus('sending');
    setErrorMessage('');
    setMissing([]);
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          selection,
          customer,
          consent,
          website: honeypot,
          // What the buyer is agreeing to: the route refuses to store a
          // different net without a second look from the buyer.
          expected: { netCents: priced.netCents, grossCents: priced.grossCents, vatMode: priced.vatMode },
        }),
      });
      const data = (await response.json()) as {
        reference?: string;
        confirmationSent?: boolean;
        error?: string;
        totals?: { netCents?: number; grossCents: number; vatMode: string };
        catalogue?: CatalogueSlice;
      };
      if (!response.ok || !data.reference || data.error) {
        setStatus('error');
        // The route answers with a code; anything unknown falls back to the
        // generic message so the buyer never sees a raw English literal.
        const code = data.error ?? '';
        setErrorMessage(code ? tError(code) : t('error.generic'));
        if (data.catalogue && (code === 'price_changed' || code === 'selection_outdated')) {
          adoptFreshSlice(data.catalogue, code === 'selection_outdated');
          // Consent was given to the old amount or configuration: ask again.
          setConsent(false);
          if (code === 'selection_outdated') {
            setStep('configure');
            setMissing([]);
          }
        }
        return;
      }
      // The server is the authority on the amount; the net cannot differ
      // (the route answers 409 instead), so a different gross is the VAT
      // treatment changing at submit time — say which way.
      const serverGross = data.totals?.grossCents;
      const serverMode = data.totals?.vatMode ?? priced.vatMode;
      const corrected =
        typeof serverGross === 'number' && serverGross !== priced.grossCents
          ? {
              total: money(serverGross),
              reason:
                data.totals?.netCents !== undefined && data.totals.netCents !== priced.netCents
                  ? ('price_changed' as const)
                  : serverMode === 'domestic' && priced.vatMode !== 'domestic'
                    ? ('vat_unverified' as const)
                    : ('vat_verified' as const),
            }
          : null;
      analytics.orderSubmitted({
        product: slug,
        model: productId,
        quantity,
        vatMode: serverMode,
        valueCents: serverGross ?? priced.grossCents,
      });
      setResult({ reference: data.reference, emailSent: data.confirmationSent !== false, corrected });
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
              {status === 'error' && errorMessage && (
                <p className="om-error" role="alert">
                  {errorMessage}
                </p>
              )}
              <Configurator
                slice={chooseable}
                models={models}
                product={product}
                selection={selection}
                priced={priced}
                locale={locale}
                localeTag={localeTag}
                onModel={chooseModel}
                onSelect={applySelection}
                onSocketTouched={() => setSocketTouched(true)}
              />
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
                  <select id="order-country" value={customer.country} autoComplete="country" onChange={(e) => chooseCountry(e.target.value)}>
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

              <p className="om-note">{vatExplanation(t, customer, vat.mode, vatStatus)}</p>
            </>
          )}

          {/* ── Step 3: review ────────────────────────────────────── */}
          {step === 'review' && (
            <>
              <h3 className="om-section-title" tabIndex={-1}>{t('review.title')}</h3>

              <div className="om-review-block">
                <div className="om-review-head">
                  <h4>
                    {product.name} × {quantity}
                  </h4>
                  <button type="button" className="om-link" onClick={() => goTo('configure')}>
                    {t('review.editConfig')}
                  </button>
                </div>
                {priced && (
                  <ul className="om-review-lines">
                    {priced.lines.map((line) => {
                      const article = byCode.get(line.code);
                      const qtyText = lineQty(line);
                      // Fire protection: its qty is booths × 0.9 m segments, which
                      // the buyer never typed — say where the 6 comes from.
                      const perSegment = article?.perSegment && priced.segments !== null;
                      // Installation of extra elements: qty is booths × extra
                      // elements (rule 7) — say so the same way.
                      const perExtension = article?.perExtension && priced.extensionSegments > 0;
                      return (
                        <li key={line.code}>
                          <span className="om-line-label">
                            <code className="om-code">{line.code}</code>{' '}
                            {article ? lineLabel(article, locale) : line.description}
                          </span>
                          {qtyText && <span className="om-line-qty">{qtyText}</span>}
                          <span className="om-line-amount">{lineAmount(line)}</span>
                          {perSegment && (
                            <span className="om-line-hint">
                              {t('review.segmentsQty', { quantity, segments: priced.segments ?? 0 })}
                            </span>
                          )}
                          {perExtension && (
                            <span className="om-line-hint">
                              {t('review.extensionQty', { quantity, elements: priced.extensionSegments })}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {matchedSocket && (
                  <p className="om-review-note">
                    {t(socketIsMatch ? 'review.socketMatched' : 'review.socketDefault', { socket: lineLabel(matchedSocket, locale) })}
                  </p>
                )}
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
                  {countryLabel(customer.country, findCountry(customer.country)?.name ?? customer.country)}
                  {'\n'}
                  {customer.email}
                  {customer.phone ? `\n${customer.phone}` : ''}
                  {customer.vatNumber ? `\n${t('details.vatNumber')}: ${customer.vatNumber}` : ''}
                </p>
              </div>

              <label className="om-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    // The "please complete" alert named this box: ticking it answers it.
                    if (e.target.checked) setMissing([]);
                  }}
                />
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
                <div className="om-error" role="alert">
                  <p>{t('review.missingTitle')}</p>
                  <ul>
                    {missing.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                </div>
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
                <Icon name="check-circle" />
              </p>
              <p className="om-done-reference">
                {t('success.referenceLabel')}: <strong>{result.reference}</strong>
              </p>
              <p>{t('success.body')}</p>
              {result.corrected && (
                <p className="om-note om-note--warn">
                  {t(
                    result.corrected.reason === 'vat_unverified'
                      ? 'success.correctedTotal'
                      : result.corrected.reason === 'vat_verified'
                        ? 'success.vatVerifiedTotal'
                        : 'success.priceChangedTotal',
                    { total: result.corrected.total }
                  )}
                </p>
              )}
              {!result.emailSent && <p className="om-note om-note--warn">{t('success.emailFallback', { reference: result.reference })}</p>}
              <p className="om-note">{transportNote}</p>
            </div>
          )}
        </div>

        {/* ── Running total + navigation ──────────────────────────── */}
        {step !== 'done' && (
          <footer className={`om-footer${step === 'review' ? '' : ' om-footer--compact'}`}>
            {/* Only the amounts are live: the static notes below sit outside
                the region so a screen reader does not re-read them on every
                option change. On a phone, steps 1 and 2 show the total only. */}
            <div className="om-totals">
              <div className="om-totals-live" aria-live="polite" aria-atomic="true">
                {priced ? (
                  <>
                    <div className="om-subtotal">
                      <span>{t('summary.net')}</span>
                      <span>{money(priced.netCents)}</span>
                    </div>
                    <div className="om-subtotal">
                      <span>{vatLabel}</span>
                      <span>{money(priced.vatCents)}</span>
                    </div>
                    <div className="om-total">
                      <span>{t('summary.total')}</span>
                      <span>{money(priced.grossCents)}</span>
                    </div>
                  </>
                ) : (
                  <p className="om-totals-note om-totals-note--warn">{t('error.pricing_failed')}</p>
                )}
              </div>
              <p className="om-totals-note om-totals-note--transport">{transportNote}</p>
              <p className="om-totals-note om-totals-note--warn" aria-live="polite">
                {priced?.hasOnRequestItems ? t('summary.onRequestNote') : ''}
              </p>
            </div>

            <p className="om-sr-only" role="status">{status === 'sending' ? t('review.submitting') : ''}</p>
            <div className="om-actions">
              {stepIndex > 0 && (
                <button type="button" className="om-btn om-btn--ghost" onClick={() => goTo(STEP_ORDER[stepIndex - 1])}>
                  {t('back')}
                </button>
              )}
              {step === 'configure' && (
                <button type="button" className="om-btn om-btn--primary" onClick={continueFromConfigure} aria-disabled={!priced}>
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
                  aria-disabled={!consent || !priced || status === 'sending'}
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
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto auto;
          align-items: baseline;
          gap: 0.2rem 0.9rem;
          padding: 0.4rem 0;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        .om-review-lines li:last-child {
          border-bottom: 0;
        }
        .om-code {
          display: inline-block;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 0.76rem;
          color: #334155;
          background: #f1f5f9;
          border-radius: 4px;
          padding: 0.05rem 0.35rem;
          margin-right: 0.45rem;
          white-space: nowrap;
        }
        .om-line-qty {
          color: #5a6b7f;
          white-space: nowrap;
        }
        .om-line-amount {
          text-align: right;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
          font-weight: 600;
        }
        .om-line-hint {
          grid-column: 1 / -1;
          font-size: 0.8rem;
          color: #5a6b7f;
        }
        .om-review-note {
          margin: 0.7rem 0 0;
          font-size: 0.82rem;
          color: #5a6b7f;
          line-height: 1.5;
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
          display: flex;
          justify-content: center;
          margin: 0 0 0.6rem;
          color: #2e7d32;
        }
        .om-done-icon :global(svg) {
          width: 42px;
          height: 42px;
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
        .om-totals-live > div {
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
        .om-totals-note:empty {
          display: none;
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
          /* A phone gets the whole screen: the dialog scrolls as one page
             inside the backdrop (no fixed-height body), the header is
             compact, and the footer sticks to the bottom with the total. */
          .om-backdrop {
            /* Block, not flex: a flex row would stretch the dialog to the
               viewport height and let the overflowing content run past its
               white background. As a block the dialog is as tall as its
               content and at least one screen. */
            display: block;
            padding: 0;
          }
          .om-dialog {
            width: 100%;
            min-height: 100%;
            max-height: none;
            border-radius: 0;
            overflow: visible;
          }
          .om-body {
            overflow: visible;
            flex: 1 0 auto;
          }
          .om-footer {
            position: sticky;
            bottom: 0;
            z-index: 1;
            padding-top: 0.75rem;
            padding-bottom: 0.9rem;
          }
          .om-header {
            padding-top: 0.9rem;
            padding-bottom: 0.6rem;
          }
          .om-header h2 {
            font-size: 1.1rem;
          }
          .om-eyebrow {
            margin-bottom: 0.15rem;
          }
          .om-steps {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
            font-size: 0.72rem;
            gap: 0.35rem;
            flex-wrap: nowrap;
            overflow-x: auto;
            white-space: nowrap;
          }
          .om-steps li + li::before {
            width: 10px;
          }
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
          .om-body {
            padding-top: 1.1rem;
            padding-bottom: 1.1rem;
          }
          .om-review-lines li {
            grid-template-columns: minmax(0, 1fr) auto;
          }
          .om-review-lines .om-line-label {
            grid-column: 1 / -1;
          }
          /* Steps 1 and 2: total only; subtotal, VAT and the transport note
             wait for the review step, where the buyer reads them anyway. */
          .om-footer--compact .om-subtotal,
          .om-footer--compact .om-totals-note--transport {
            display: none;
          }
          .om-footer--compact .om-total {
            border-top: 0;
            margin-top: 0;
            padding-top: 0 !important;
          }
          .om-footer--compact .om-totals {
            margin-bottom: 0.6rem;
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
