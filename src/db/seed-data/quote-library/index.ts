import { PART1 } from "./part1";
import { PART2 } from "./part2";
import { PART3 } from "./part3";
import { PART4 } from "./part4";
import { PART5 } from "./part5";
import { PART6 } from "./part6";
import { QUOTE_CATEGORIES, type LibraryQuote } from "./types";

export { QUOTE_CATEGORIES };
export type { LibraryQuote };

/** The built-in quote library: public-domain scripture (KJV), classical and
 * historical figures, proverbs, and short well-known modern lines. Entries
 * marked "(attributed)" are widely credited to that person but the original
 * source is uncertain. */
export const QUOTE_LIBRARY: (LibraryQuote & { id: string })[] = [...PART1, ...PART2, ...PART3, ...PART4, ...PART5, ...PART6].map(
  (q, i) => ({ ...q, id: `lib-${i}` }),
);

export function categoryLabel(slug: string | null | undefined) {
  if (!slug) return null;
  return QUOTE_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
