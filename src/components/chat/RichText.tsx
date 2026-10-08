import { Fragment, type ReactNode } from "react";

// Tiny, dependency-free markdown renderer for assistant replies.
// Supports **bold**, *italic*, `code`, headings, > quotes, - / * / 1. lists.
// Builds React nodes only (never raw HTML), so it is safe against injection.

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) out.push(<strong key={i++} className="font-semibold text-neutral-50">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={i++} className="rounded bg-neutral-800 px-1 py-0.5 text-[0.85em]">{tok.slice(1, -1)}</code>);
    else out.push(<em key={i++}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function RichText({ text }: { text: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let quote: string[] = [];
  let key = 0;

  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={key++} className={`my-1 ml-5 space-y-0.5 ${list.ordered ? "list-decimal" : "list-disc"}`}>
        {list.items.map((it, j) => (
          <li key={j}>{inline(it)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };
  const flushQuote = () => {
    if (!quote.length) return;
    blocks.push(
      <blockquote key={key++} className="my-1.5 border-l-2 border-indigo-500/60 pl-3 italic text-neutral-300">
        {quote.map((q, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {inline(q)}
          </Fragment>
        ))}
      </blockquote>,
    );
    quote = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const q = line.match(/^>\s?(.*)$/);
    const ul = line.match(/^\s*[-*•]\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const h = line.match(/^#{1,6}\s+(.*)$/);

    if (q) {
      flushList();
      quote.push(q[1]);
      continue;
    }
    flushQuote();

    if (ul || ol) {
      const ordered = !!ol;
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push((ul ?? ol)![1]);
      continue;
    }
    flushList();

    if (h) blocks.push(<p key={key++} className="mt-1 font-semibold text-neutral-50">{inline(h[1])}</p>);
    else if (line.trim() === "") blocks.push(<div key={key++} className="h-2" />);
    else blocks.push(<p key={key++}>{inline(line)}</p>);
  }
  flushList();
  flushQuote();

  return <>{blocks}</>;
}
