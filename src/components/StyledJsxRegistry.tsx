'use client';

import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { StyleRegistry, createStyleRegistry } from 'styled-jsx';

/**
 * Server-side rendering for styled-jsx in the App Router.
 *
 * Without this registry every `<style jsx>` block on the site (header,
 * footer, hero, all product pages) was injected only after hydration: the
 * server HTML carried the jsx-* class names but not a single <style> tag.
 * Pages therefore painted unstyled first, re-laid out once JavaScript ran
 * (CLS 0.5-0.6 on mobile) and the LCP element was only "rendered" after
 * hydration (render delay of 4-8 s on a throttled phone).
 *
 * `useServerInsertedHTML` flushes the collected styles into the streamed
 * HTML head, so the first paint is already styled.
 * https://nextjs.org/docs/app/building-your-application/styling/css-in-js#styled-jsx
 */
export default function StyledJsxRegistry({ children }: { children: React.ReactNode }) {
  const [jsxStyleRegistry] = useState(() => createStyleRegistry());

  useServerInsertedHTML(() => {
    const styles = jsxStyleRegistry.styles();
    jsxStyleRegistry.flush();
    return <>{styles}</>;
  });

  return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>;
}
