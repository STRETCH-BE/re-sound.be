/**
 * The calculator FAQ entries (calculator.faq.<key>.question / .answer).
 * Plain module — imported by the server route for the FAQPage JSON-LD and by
 * the client page for the visible list; a 'use client' module cannot export
 * a value the server calls .map() on.
 */
export const CALCULATOR_FAQ_KEYS = ['officeTarget', 'hardFinishes', 'howManyM2'] as const;
