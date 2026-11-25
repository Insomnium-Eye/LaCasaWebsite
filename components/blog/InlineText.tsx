import { Fragment, ReactNode } from 'react';
import Link from 'next/link';

// **bold** or [text](href) — the only inline marks blog text supports.
const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Same-site paths ("/rides") or https URLs only — never javascript:, data:, or protocol-relative. */
const isSafeHref = (href: string) => (href.startsWith('/') && !href.startsWith('//')) || href.startsWith('https://');

/**
 * Renders blog text with **bold** and [links](/path) as React elements
 * (no raw HTML), so post content can never inject markup or scripts.
 */
export default function InlineText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const start = match.index ?? 0;
    if (start > last) parts.push(text.slice(last, start));
    const [, bold, linkText, href] = match;
    if (bold !== undefined) {
      parts.push(<strong key={start} className="font-semibold text-slate-900">{bold}</strong>);
    } else if (isSafeHref(href)) {
      const className = 'font-semibold text-terracotta underline decoration-terracotta/40 underline-offset-2 hover:decoration-terracotta';
      parts.push(
        href.startsWith('/') ? (
          <Link key={start} href={href} className={className}>{linkText}</Link>
        ) : (
          <a key={start} href={href} target="_blank" rel="noopener noreferrer" className={className}>{linkText}</a>
        ),
      );
    } else {
      parts.push(linkText);
    }
    last = start + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

export { isSafeHref };
