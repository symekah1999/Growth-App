import { requireUser } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import { REALITIES, REALITY_THEMES, getRealityOfTheDay } from "@/db/seed-data/realities";
import { ArrowRight, NotebookPen, Target } from "lucide-react";
import Link from "next/link";

function journalHref(truth: string) {
  return `/journal?prompt=${encodeURIComponent(truth)}`;
}

export default async function RealitiesPage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  await requireUser();
  const { theme } = await searchParams;
  const today = getRealityOfTheDay();
  const themes = theme ? REALITY_THEMES.filter((t) => t.slug === theme) : REALITY_THEMES;

  return (
    <div>
      <PageHeader
        title="Realities of Life"
        subtitle={`${REALITIES.length} hard truths, each with one thing to do about it. Read slowly, apply one at a time.`}
      />

      <Card className="mb-6 bg-gradient-to-br from-amber-950/30 via-neutral-900/60 to-neutral-900/40 border-amber-900/50">
        <p className="text-xs font-medium uppercase tracking-wide text-amber-400">Reality of the day</p>
        <p className="mt-2 text-2xl font-semibold leading-snug tracking-tight text-neutral-50">{today.truth}</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-300">{today.detail}</p>
        <div className="mt-4 flex flex-wrap items-start gap-3">
          <div className="flex max-w-2xl items-start gap-2 rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-2">
            <Target size={15} className="mt-0.5 shrink-0 text-amber-300" />
            <p className="text-sm text-neutral-200">
              <span className="font-medium">Today:</span> {today.action}
            </p>
          </div>
          <Link
            href={journalHref(today.truth)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
          >
            <NotebookPen size={14} /> Reflect in journal
          </Link>
        </div>
      </Card>

      <div className="mb-6 flex flex-wrap gap-1.5">
        <Link
          href="/realities"
          className={`rounded-full border px-3 py-1 text-xs ${
            !theme ? "border-amber-600 bg-amber-600/15 text-amber-300" : "border-neutral-800 text-neutral-400 hover:bg-neutral-800/60"
          }`}
        >
          All themes
        </Link>
        {REALITY_THEMES.map((t) => (
          <Link
            key={t.slug}
            href={`/realities?theme=${t.slug}`}
            className={`rounded-full border px-3 py-1 text-xs ${
              theme === t.slug
                ? "border-amber-600 bg-amber-600/15 text-amber-300"
                : "border-neutral-800 text-neutral-400 hover:bg-neutral-800/60"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="space-y-8">
        {themes.map((t) => {
          const items = REALITIES.filter((r) => r.theme === t.slug);
          return (
            <section key={t.slug}>
              <div className="mb-3 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <h2 className="text-lg font-semibold text-neutral-100">{t.label}</h2>
                <p className="text-sm text-neutral-500">{t.blurb}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((r, i) => (
                  <Card key={r.id} className="flex flex-col">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-medium text-neutral-400">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium leading-snug text-neutral-50">{r.truth}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{r.detail}</p>
                      </div>
                    </div>
                    <div className="mt-auto pt-3">
                      <div className="flex items-start gap-2 rounded-lg bg-neutral-950/50 px-3 py-2 text-sm text-neutral-300">
                        <ArrowRight size={14} className="mt-0.5 shrink-0 text-amber-400" />
                        {r.action}
                      </div>
                      <Link
                        href={journalHref(r.truth)}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300"
                      >
                        <NotebookPen size={12} /> Reflect in journal
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
