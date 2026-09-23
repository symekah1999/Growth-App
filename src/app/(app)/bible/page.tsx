import { db } from "@/db";
import { bibleBooks } from "@/db/schema";
import { asc } from "drizzle-orm";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { getVerseOfTheDay } from "@/lib/daily";
import Link from "next/link";

export default async function BiblePage() {
  const books = await db.select().from(bibleBooks).orderBy(asc(bibleBooks.sortOrder));
  const verse = books.length > 0 ? await getVerseOfTheDay() : null;

  if (books.length === 0) {
    return (
      <div>
        <PageHeader title="Bible" subtitle="Full KJV text, verse of the day, and a chapter reader." />
        <EmptyState
          title="Bible not seeded yet"
          subtitle="Run `npm run db:seed` after setting up your Neon database — see README.md."
        />
      </div>
    );
  }

  const old = books.filter((b) => b.testament === "old");
  const nt = books.filter((b) => b.testament === "new");

  return (
    <div>
      <PageHeader title="Bible" subtitle="King James Version — the whole text, always available." />

      {verse && (
        <Card className="mb-6 border-indigo-900/60 bg-indigo-950/20">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-400">Verse of the day</p>
          <p className="mt-2 text-lg italic text-neutral-100">&ldquo;{verse.text}&rdquo;</p>
          <p className="mt-2 text-sm text-neutral-400">
            {verse.book} {verse.chapter}:{verse.verse}
          </p>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-medium text-neutral-300">Old Testament</h2>
          <div className="flex flex-wrap gap-2">
            {old.map((b) => (
              <Link
                key={b.id}
                href={`/bible/${b.id}/1`}
                className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800/60"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium text-neutral-300">New Testament</h2>
          <div className="flex flex-wrap gap-2">
            {nt.map((b) => (
              <Link
                key={b.id}
                href={`/bible/${b.id}/1`}
                className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800/60"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
