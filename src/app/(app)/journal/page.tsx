import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, asc, desc, eq, gte, ilike, or } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Input, Textarea, Button, Badge } from "@/components/ui";
import { createEntry, deleteEntry } from "./actions";
import { addDaysISO, formatDate, todayISO } from "@/lib/utils";
import { MOOD_SCORE } from "@/lib/mood";
import { TrendLine } from "@/components/charts/TrendLine";
import Link from "next/link";

const MOODS = ["grateful", "energized", "neutral", "anxious", "low", "reflective", "hopeful"];

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mood?: string; prompt?: string }>;
}) {
  const user = await requireUser();
  const { q, mood, prompt } = await searchParams;

  const conditions = [eq(journalEntries.userId, user.id)];
  if (mood) conditions.push(eq(journalEntries.mood, mood));
  if (q) {
    conditions.push(
      or(ilike(journalEntries.title, `%${q}%`), ilike(journalEntries.body, `%${q}%`))!,
    );
  }

  const entries = await db
    .select()
    .from(journalEntries)
    .where(and(...conditions))
    .orderBy(desc(journalEntries.entryDate), desc(journalEntries.createdAt))
    .limit(100);

  // Mood trend: average mood score per day over the last 60 days
  const since = addDaysISO(todayISO(), -59);
  const recent = await db
    .select({ entryDate: journalEntries.entryDate, mood: journalEntries.mood })
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, user.id), gte(journalEntries.entryDate, since)))
    .orderBy(asc(journalEntries.entryDate));
  const byDay = new Map<string, number[]>();
  for (const e of recent) {
    if (!e.mood || MOOD_SCORE[e.mood] === undefined) continue;
    byDay.set(e.entryDate, [...(byDay.get(e.entryDate) ?? []), MOOD_SCORE[e.mood]]);
  }
  const moodSeries = [...byDay.entries()].map(([d, scores]) => ({
    label: formatDate(d, { month: "short", day: "numeric" }),
    value: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
  }));
  const journalDays = new Set(recent.map((e) => e.entryDate)).size;

  return (
    <div>
      <PageHeader
        title="Journal"
        subtitle="A private record of how things are actually going."
      />

      <Card className="mb-6">
        {prompt && (
          <div className="mb-3 rounded-lg border border-amber-900/50 bg-amber-950/20 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-400">Reflecting on</p>
            <p className="mt-0.5 text-sm text-neutral-100">{prompt}</p>
            <p className="mt-1 text-xs text-neutral-500">Where do you see this in your life right now? What will you do about it?</p>
          </div>
        )}
        <form action={createEntry} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input name="title" placeholder="Title (optional)" defaultValue={prompt ?? ""} />
            <Input type="date" name="entryDate" defaultValue={todayISO()} />
          </div>
          <Textarea name="body" placeholder="What's on your mind today?" rows={4} required />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="mood"
              defaultValue=""
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-indigo-500"
            >
              <option value="">Mood (optional)</option>
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <Input name="tags" placeholder="Tags, comma separated" />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save entry</Button>
          </div>
        </form>
      </Card>

      {moodSeries.length >= 2 && (
        <Card className="mb-6">
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-medium text-neutral-300">Mood — last 60 days</h2>
            <span className="text-xs text-neutral-500">
              journaled on <span className="font-medium text-neutral-300">{journalDays}</span> of 60 days
            </span>
          </div>
          <TrendLine data={moodSeries} format="mood" domain={[-2, 2]} ticks={[-2, -1, 0, 1, 2]} seriesName="Mood" color="#0ea5e9" />
        </Card>
      )}

      <form className="mb-4 flex flex-wrap gap-2" action="/journal">
        <Input name="q" defaultValue={q ?? ""} placeholder="Search entries..." className="max-w-xs" />
        <select
          name="mood"
          defaultValue={mood ?? ""}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-indigo-500"
        >
          <option value="">All moods</option>
          {MOODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <Button type="submit" variant="ghost">
          Filter
        </Button>
      </form>

      {entries.length === 0 ? (
        <EmptyState title="No entries yet" subtitle="Write your first journal entry above." />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/journal/${e.id}`} className="font-medium text-neutral-100 hover:underline">
                      {e.title || formatDate(e.entryDate)}
                    </Link>
                    {e.mood && <Badge>{e.mood}</Badge>}
                    <span className="text-xs text-neutral-500">{formatDate(e.entryDate)}</span>
                  </div>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-neutral-400">{e.body}</p>
                  {e.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {e.tags.map((t) => (
                        <Badge key={t} className="border-neutral-800 text-neutral-500">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <form action={deleteEntry}>
                  <input type="hidden" name="id" value={e.id} />
                  <Button type="submit" variant="danger" className="shrink-0">
                    Delete
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
