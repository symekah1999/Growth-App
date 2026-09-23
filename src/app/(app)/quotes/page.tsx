import { db } from "@/db";
import { quotes } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Input, Button, Badge } from "@/components/ui";
import { addQuote, deleteQuote, saveLibraryQuote } from "./actions";
import { getQuoteOfTheDay } from "@/lib/daily";
import { QUOTE_CATEGORIES, QUOTE_LIBRARY, categoryLabel } from "@/db/seed-data/quote-library";
import { Bookmark, BookmarkCheck, Search } from "lucide-react";
import Link from "next/link";

type Params = { tab?: string; cat?: string; q?: string };

function href(p: Params) {
  const sp = new URLSearchParams();
  if (p.tab && p.tab !== "library") sp.set("tab", p.tab);
  if (p.cat) sp.set("cat", p.cat);
  if (p.q) sp.set("q", p.q);
  const s = sp.toString();
  return s ? `/quotes?${s}` : "/quotes";
}

export default async function QuotesPage({ searchParams }: { searchParams: Promise<Params> }) {
  const user = await requireUser();
  const { tab = "library", cat, q } = await searchParams;

  const [rows, qotd] = await Promise.all([
    db.select().from(quotes).where(eq(quotes.userId, user.id)).orderBy(desc(quotes.createdAt)),
    getQuoteOfTheDay(user.id),
  ]);
  const savedTexts = new Set(rows.map((r) => r.text));

  const needle = q?.trim().toLowerCase();
  const libraryResults = QUOTE_LIBRARY.filter(
    (x) =>
      (!cat || x.category === cat) &&
      (!needle || x.text.toLowerCase().includes(needle) || x.author.toLowerCase().includes(needle)),
  );
  const mineResults = rows.filter(
    (x) =>
      (!cat || x.category === cat) &&
      (!needle || x.text.toLowerCase().includes(needle) || (x.author ?? "").toLowerCase().includes(needle)),
  );
  const counts = new Map<string, number>();
  for (const x of QUOTE_LIBRARY) counts.set(x.category, (counts.get(x.category) ?? 0) + 1);
  const activeCat = QUOTE_CATEGORIES.find((c) => c.slug === cat);

  return (
    <div>
      <PageHeader
        title="Quotes"
        subtitle={`${QUOTE_LIBRARY.length} quotes across ${QUOTE_CATEGORIES.length} themes, plus your own collection.`}
      />

      {qotd && (
        <Card className="mb-6 border-amber-900/60 bg-amber-950/10">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-400">Quote of the day</p>
          <p className="mt-2 text-lg italic text-neutral-100">&ldquo;{qotd.text}&rdquo;</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-neutral-400">
            {qotd.author && <span>— {qotd.author}</span>}
            {qotd.category && <Badge>{categoryLabel(qotd.category)}</Badge>}
          </div>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-neutral-800 p-0.5">
          {[
            { key: "library", label: `Library (${QUOTE_LIBRARY.length})` },
            { key: "mine", label: `My quotes (${rows.length})` },
          ].map((t) => (
            <Link
              key={t.key}
              href={href({ tab: t.key, cat, q })}
              className={`rounded-md px-3 py-1.5 text-sm ${
                tab === t.key ? "bg-indigo-600/20 text-indigo-300" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <form action="/quotes" className="ml-auto flex min-w-[220px] flex-1 items-center gap-2 sm:max-w-xs">
          {tab !== "library" && <input type="hidden" name="tab" value={tab} />}
          {cat && <input type="hidden" name="cat" value={cat} />}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-500" />
            <Input name="q" defaultValue={q ?? ""} placeholder="Search text or author" className="pl-8" />
          </div>
        </form>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        <Link
          href={href({ tab, q })}
          className={`rounded-full border px-3 py-1 text-xs ${
            !cat ? "border-indigo-600 bg-indigo-600/15 text-indigo-300" : "border-neutral-800 text-neutral-400 hover:bg-neutral-800/60"
          }`}
        >
          All
        </Link>
        {QUOTE_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={href({ tab, cat: c.slug, q })}
            className={`rounded-full border px-3 py-1 text-xs ${
              cat === c.slug
                ? "border-indigo-600 bg-indigo-600/15 text-indigo-300"
                : "border-neutral-800 text-neutral-400 hover:bg-neutral-800/60"
            }`}
          >
            {c.label} <span className="text-neutral-600">{counts.get(c.slug) ?? 0}</span>
          </Link>
        ))}
      </div>

      {activeCat && <p className="mb-4 text-sm text-neutral-400">{activeCat.blurb}</p>}

      {tab === "library" ? (
        libraryResults.length === 0 ? (
          <EmptyState title="No quotes match" subtitle="Try a different theme or search term." />
        ) : (
          <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
            {libraryResults.map((x) => {
              const saved = savedTexts.has(x.text);
              return (
                <Card key={x.id} className="mb-3 break-inside-avoid">
                  <p className="text-[15px] leading-relaxed text-neutral-100">&ldquo;{x.text}&rdquo;</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-neutral-400">— {x.author}</p>
                      {!cat && (
                        <Link href={href({ tab, cat: x.category })} className="text-[11px] text-neutral-600 hover:text-neutral-400">
                          {categoryLabel(x.category)}
                        </Link>
                      )}
                    </div>
                    {saved ? (
                      <span className="flex items-center gap-1 text-xs text-indigo-300">
                        <BookmarkCheck size={14} /> Saved
                      </span>
                    ) : (
                      <form action={saveLibraryQuote}>
                        <input type="hidden" name="libraryId" value={x.id} />
                        <button type="submit" className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-200">
                          <Bookmark size={14} /> Save
                        </button>
                      </form>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <>
          <Card className="mb-6">
            <p className="mb-3 text-sm font-medium text-neutral-300">Add your own</p>
            <form action={addQuote} className="space-y-3">
              <Input name="text" placeholder="Quote text" required />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input name="author" placeholder="Author (optional)" />
                <select
                  name="category"
                  defaultValue={cat ?? ""}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-indigo-500"
                >
                  <option value="">Theme (optional)</option>
                  {QUOTE_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Add quote</Button>
              </div>
            </form>
          </Card>

          {mineResults.length === 0 ? (
            <EmptyState
              title={rows.length === 0 ? "Your collection is empty" : "No saved quotes match"}
              subtitle={rows.length === 0 ? "Save quotes from the Library, or add your own above." : "Try a different theme or search."}
            />
          ) : (
            <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
              {mineResults.map((x) => (
                <Card key={x.id} className="mb-3 break-inside-avoid">
                  <p className="text-[15px] leading-relaxed text-neutral-100">&ldquo;{x.text}&rdquo;</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2 text-xs text-neutral-400">
                      {x.author && <span className="truncate">— {x.author}</span>}
                      {x.category && <Badge>{categoryLabel(x.category)}</Badge>}
                    </div>
                    <form action={deleteQuote}>
                      <input type="hidden" name="id" value={x.id} />
                      <button className="text-xs text-red-500 hover:text-red-400" type="submit">
                        remove
                      </button>
                    </form>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
