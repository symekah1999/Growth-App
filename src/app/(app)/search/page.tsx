import { requireUser } from "@/lib/auth";
import { searchAll } from "@/lib/search";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { photoUrl } from "@/lib/images";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const { q = "" } = await searchParams;
  const query = q.trim();
  const groups = query.length >= 2 ? await searchAll(user.id, query) : [];
  const total = groups.reduce((s, g) => s + g.total, 0);

  return (
    <div>
      <PageHeader
        image={photoUrl("quotes")}
        eyebrow="Search"
        title="Find anything"
        subtitle="Your journal, goals, lessons, gratitude, quotes, the Bible and every built-in library, in one place."
      />

      <form action="/search" className="mb-5 flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Search e.g. patience, Mum, budget, Proverbs…"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 py-2.5 pl-9 pr-3 text-sm text-neutral-50 outline-none focus:border-indigo-500"
          />
        </div>
        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          Search
        </button>
      </form>

      {query.length < 2 ? (
        <EmptyState title="Type at least two letters" subtitle="Search matches words inside everything you've written and saved." />
      ) : groups.length === 0 ? (
        <EmptyState title={`Nothing found for “${query}”`} subtitle="Try a shorter word or a different spelling." />
      ) : (
        <>
          <p className="mb-3 text-sm text-neutral-400">
            {total} result{total === 1 ? "" : "s"} for <span className="text-neutral-200">“{query}”</span>
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {groups.map((g) => (
              <Card key={g.key}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-neutral-100">
                    {g.label} <span className="font-normal text-neutral-500">· {g.total}</span>
                  </h2>
                  <Link href={g.href} className="flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200">
                    Open <ArrowRight size={12} />
                  </Link>
                </div>
                <ul className="divide-y divide-neutral-800/70">
                  {g.items.map((it, i) => (
                    <li key={i}>
                      <Link href={it.href} className="block rounded px-1 py-2 transition hover:bg-neutral-800/50">
                        <p className="line-clamp-2 text-sm font-medium text-neutral-100">{it.title}</p>
                        {it.snippet && <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-neutral-400">{it.snippet}</p>}
                        {it.meta && <p className="mt-0.5 text-[11px] text-neutral-600">{it.meta}</p>}
                      </Link>
                    </li>
                  ))}
                </ul>
                {g.total > g.items.length && (
                  <p className="mt-2 text-xs text-neutral-500">
                    and {g.total - g.items.length} more —{" "}
                    <Link href={g.href} className="text-indigo-300 hover:text-indigo-200">
                      see all
                    </Link>
                  </p>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
