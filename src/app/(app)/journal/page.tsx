import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Input, Textarea, Button, Badge } from "@/components/ui";
import { createEntry, deleteEntry } from "./actions";
import { formatDate, todayISO } from "@/lib/utils";
import Link from "next/link";

const MOODS = ["grateful", "energized", "neutral", "anxious", "low", "reflective", "hopeful"];

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mood?: string }>;
}) {
  const user = await requireUser();
  const { q, mood } = await searchParams;

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

  return (
    <div>
      <PageHeader
        title="Journal"
        subtitle="A private record of how things are actually going."
      />

      <Card className="mb-6">
        <form action={createEntry} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input name="title" placeholder="Title (optional)" />
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
