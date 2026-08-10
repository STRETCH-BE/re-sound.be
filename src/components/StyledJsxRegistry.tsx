'use client';

import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { StyleRegistry, createStyleRegistry } from 'styled-jsx';

/**
 * Server-renders styled-jsx styles into the HTML.
 *
 * Without this registry, styled-jsx (which styles nearly every component on
 * this site) injects its <style> tags only on the client, during hydration.
 * The server HTML shipped with ZERO component styles: pages rendered with
 * bare globals.css (expanded language dropdown, unpositioned header,
 * collapsed hero) and then reflowed all at once when hydration injected the
 * styles — a single ~0.4-0.5 Cumulative Layout Shift on every page and the
 * main reason PageSpeed flagged the hero as a layout-shift culprit.
 *
 * This is the standard App Router pattern from the Next.js CSS-in-JS docs:
 * collect styles during server rendering and flush them into the document
 * via useServerInsertedHTML.
 */
export default function StyledJsxRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only create the stylesheet once, with lazy initial state
  const [jsxStyleRegistry] = useState(() => createStyleRegistry());

  useServerInsertedHTML(() => {
    const styles = jsxStyleRegistry.styles();
    jsxStyleRegistry.flush();
    return <>{styles}</>;
  });

  return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>;
}
