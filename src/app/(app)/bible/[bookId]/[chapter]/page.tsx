import { db } from "@/db";
import { bibleBooks, bibleVerses } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader, Card } from "@/components/ui";
import Link from "next/link";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ bookId: string; chapter: string }>;
}) {
  const { bookId: bookIdStr, chapter: chapterStr } = await params;
  const bookId = Number(bookIdStr);
  const chapter = Number(chapterStr);

  const [book] = await db.select().from(bibleBooks).where(eq(bibleBooks.id, bookId)).limit(1);
  if (!book) notFound();

  const verses = await db
    .select()
    .from(bibleVerses)
    .where(and(eq(bibleVerses.bookId, bookId), eq(bibleVerses.chapter, chapter)))
    .orderBy(asc(bibleVerses.verse));

  if (verses.length === 0) notFound();

  const prevChapter = chapter > 1 ? chapter - 1 : null;
  const nextChapter = chapter < book.chapterCount ? chapter + 1 : null;

  return (
    <div>
      <PageHeader
        title={`${book.name} ${chapter}`}
        subtitle={`${book.chapterCount} chapters &middot; KJV`}
        action={
          <Link href="/bible" className="text-sm text-neutral-400 hover:text-neutral-200">
            ← All books
          </Link>
        }
      />

      <Card>
        <div className="space-y-2 leading-relaxed">
          {verses.map((v) => (
            <p key={v.id} className="text-neutral-200">
              <span className="mr-2 align-super text-xs text-neutral-500">{v.verse}</span>
              {v.text}
            </p>
          ))}
        </div>
      </Card>

      <div className="mt-4 flex items-center justify-between text-sm">
        {prevChapter ? (
          <Link href={`/bible/${bookId}/${prevChapter}`} className="text-neutral-400 hover:text-neutral-200">
            ← Chapter {prevChapter}
          </Link>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap justify-center gap-1 max-w-md">
          {Array.from({ length: book.chapterCount }, (_, i) => i + 1).map((c) => (
            <Link
              key={c}
              href={`/bible/${bookId}/${c}`}
              className={`rounded px-2 py-0.5 text-xs ${
                c === chapter ? "bg-indigo-600 text-white" : "text-neutral-500 hover:bg-neutral-800"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
        {nextChapter ? (
          <Link href={`/bible/${bookId}/${nextChapter}`} className="text-neutral-400 hover:text-neutral-200">
            Chapter {nextChapter} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
