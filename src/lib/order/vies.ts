/**
 * VAT number verification through the European Commission's VIES service.
 *
 * A number that VIES rejects is treated as invalid, so the order is taxed at
 * the Polish rate. A number VIES cannot answer for (service down, timeout)
 * falls back to the format check and the order e-mail says the number still
 * has to be verified by hand — never silently zero-rated on a guess.
 */
import { splitVatNumber, viesCountryCode } from './vat';

export interface ViesResult {
  /** false when the service could not be reached in time */
  checked: boolean;
  /** null when `checked` is false */
  valid: boolean | null;
  /** Registered name, when VIES returns one */
  name?: string;
  /** Registered address, when VIES returns one */
  address?: string;
}

const VIES_URL = 'https://ec.europa.eu/taxation_customs/vies/rest-api/ms';
const TIMEOUT_MS = 6000;

export async function checkVatNumber(vatNumber: string): Promise<ViesResult> {
  const parts = splitVatNumber(vatNumber);
  if (!parts) return { checked: true, valid: false };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(
      `${VIES_URL}/${viesCountryCode(parts.country)}/vat/${encodeURIComponent(parts.body)}`,
      { signal: controller.signal, headers: { Accept: 'application/json' }, cache: 'no-store' }
    );
    if (!response.ok) return { checked: false, valid: null };
    const data = (await response.json()) as { isValid?: boolean; name?: string; address?: string };
    if (typeof data.isValid !== 'boolean') return { checked: false, valid: null };
    return {
      checked: true,
      valid: data.isValid,
      name: typeof data.name === 'string' && data.name !== '---' ? data.name : undefined,
      address: typeof data.address === 'string' && data.address !== '---' ? data.address : undefined,
    };
  } catch {
    return { checked: false, valid: null };
  } finally {
    clearTimeout(timer);
  }
}
