import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { photoUrl } from "@/lib/images";
import { addDaysISO, formatDate } from "@/lib/utils";
import { nairobiToday } from "@/lib/challenge";
import { SECTIONS, loadEntries, type Entry, type SectionKey } from "@/lib/entries";

export const dynamic = "force-dynamic";

const WEEKDAY = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" });
const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Nairobi" });

function dayLabel(day: string, today: string) {
  if (day === today) return "Today";
  if (day === addDaysISO(today, -1)) return "Yesterday";
  return `${WEEKDAY.format(new Date(day + "T12:00:00Z"))}, ${formatDate(day)}`;
}

function EntryCard({ e }: { e: Entry }) {
  const sec = SECTIONS.find((s) => s.key === e.section)!;
  const time = e.at !== Date.parse(e.day + "T12:00:00Z") ? TIME.format(new Date(e.at)) : "";
  const total = e.lines.reduce((n, l) => n + l.t.length, 0);
  const body = (lines: Entry["lines"]) => (
    <div className="space-y-1">
      {lines.map((l, i) => (
        <p key={i} className="whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-300">
          {l.l && <span className="mr-1.5 text-xs font-medium text-neutral-500">{l.l}:</span>}
          {l.t}
        </p>
      ))}
    </div>
  );
  return (
    <Card className="!p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sec.color}`}>{sec.label}</span>
          <p className="mt-1 text-sm font-semibold text-neutral-50">{e.title}</p>
        </div>
        {time && <span className="shrink-0 text-xs tabular-nums text-neutral-500">{time}</span>}
      </div>
      <div className="mt-2">
        {total > 360 ? (
          <details className="group">
            <summary className="cursor-pointer list-none">
              <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-300 group-open:hidden">{e.lines.map((l) => l.t).join(" · ")}</p>
              <span className="text-xs text-indigo-300 group-open:hidden">Show more</span>
              <span className="hidden text-xs text-indigo-300 group-open:inline">Show less</span>
            </summary>
            <div className="mt-2">{body(e.lines)}</div>
          </details>
        ) : (
          body(e.lines)
        )}
      </div>
      <Link href={e.href} className="mt-2 inline-block text-xs text-neutral-500 hover:text-neutral-200">Open in {sec.label} →</Link>
    </Card>
  );
}

export default async function EntriesPage({ searchParams }: { searchParams: Promise<{ s?: string; q?: string; days?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const today = nairobiToday();
  const days = Math.min(365, Math.max(7, Number(sp.days) || 30));
  const section = SECTIONS.some((s) => s.key === sp.s) ? (sp.s as SectionKey) : null;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const since = addDaysISO(today, -(days - 1));

  const all = await loadEntries(user.id, since);
  const counts = new Map<string, number>();
  for (const e of all) counts.set(e.section, (counts.get(e.section) ?? 0) + 1);
  const needle = q.toLowerCase();
  const shown = all.filter((e) => (!section || e.section === section) && (!needle || `${e.title} ${e.lines.map((l) => l.t).join(" ")}`.toLowerCase().includes(needle)));

  const groups: { day: string; items: Entry[] }[] = [];
  for (const e of shown) {
    const g = groups[groups.length - 1];
    if (g && g.day === e.day) g.items.push(e);
    else groups.push({ day: e.day, items: [e] });
  }

  const href = (o: { s?: string | null; days?: number }) => {
    const p = new URLSearchParams();
    const s = o.s === undefined ? section : o.s;
    if (s) p.set("s", s);
    if (q) p.set("q", q);
    p.set("days", String(o.days ?? days));
    return `/entries?${p.toString()}`;
  };

  return (
    <div>
      <PageHeader image={photoUrl("journal")} title="Entries" subtitle={`Everything you have logged in the last ${days} days, in one place.`} />

      <form action="/entries" className="mb-3 flex gap-2">
        {section && <input type="hidden" name="s" value={section} />}
        <input type="hidden" name="days" value={days} />
        <input name="q" defaultValue={q} placeholder="Search your entries" className="h-11 min-w-0 flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500 focus:outline-none" />
        <button type="submit" className="h-11 rounded-lg bg-neutral-100 px-4 text-sm font-semibold text-neutral-900 active:bg-neutral-300">Search</button>
      </form>

      <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <Link href={href({ s: null })} className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${!section ? "bg-indigo-600/25 text-indigo-100" : "bg-neutral-900 text-neutral-400 hover:text-neutral-100"}`}>All {all.length}</Link>
        {SECTIONS.map((s) => (
          <Link key={s.key} href={href({ s: s.key })} className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${section === s.key ? "bg-indigo-600/25 text-indigo-100" : "bg-neutral-900 text-neutral-400 hover:text-neutral-100"}`}>
            {s.label} {counts.get(s.key) ?? 0}
          </Link>
        ))}
      </div>

      {groups.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-300">{q || section ? "No entries match this filter." : "Nothing logged in this period yet. Everything you write in the app will show up here."}</p>
        </Card>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <section key={g.day}>
              <h2 className="sticky top-0 z-10 -mx-4 mb-2 bg-neutral-950/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400 backdrop-blur sm:mx-0 sm:px-0">
                {dayLabel(g.day, today)} <span className="ml-1 font-normal text-neutral-600">· {g.items.length}</span>
              </h2>
              <div className="space-y-2">{g.items.map((e) => <EntryCard key={e.id} e={e} />)}</div>
            </section>
          ))}
        </div>
      )}

      {days < 365 && (
        <div className="mt-6 text-center">
          <Link href={href({ days: Math.min(365, days + 30) })} className="inline-flex h-11 items-center rounded-lg border border-neutral-700 px-5 text-sm text-neutral-200 hover:bg-neutral-800">Load 30 more days</Link>
        </div>
      )}
    </div>
  );
}
