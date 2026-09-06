import type { Msg } from '@/data/specs/types';

/** next-intl `t` created with `getTranslations()` (no namespace). */
export type RootT = (key: string) => string;

export function resolveMsg(t: RootT, m: Msg): string {
  return typeof m === 'string' ? m : t(m.key);
}
