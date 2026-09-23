import { db } from "@/db";
import { quotes } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Input, Button, Badge } from "@/components/ui";
import { addQuote, deleteQuote } from "./actions";
import { getQuoteOfTheDay } from "@/lib/daily";

export default async function QuotesPage() {
  const user = await requireUser();

  const [rows, qotd] = await Promise.all([
    db.select().from(quotes).where(eq(quotes.userId, user.id)).orderBy(desc(quotes.createdAt)),
    getQuoteOfTheDay(user.id),
  ]);

  return (
    <div>
      <PageHeader title="Quotes" subtitle="Your own bank of words that keep you moving." />

      {qotd && (
        <Card className="mb-6 border-indigo-900/60 bg-indigo-950/20">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-400">Quote of the day</p>
          <p className="mt-2 text-lg italic text-neutral-100">&ldquo;{qotd.text}&rdquo;</p>
          {qotd.author && <p className="mt-2 text-sm text-neutral-400">— {qotd.author}</p>}
        </Card>
      )}

      <Card className="mb-6">
        <form action={addQuote} className="space-y-3">
          <Input name="text" placeholder="Quote text" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="author" placeholder="Author (optional)" />
            <Input name="category" placeholder="Category (optional)" />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add quote</Button>
          </div>
        </form>
      </Card>

      {rows.length === 0 ? (
        <EmptyState title="No quotes yet" subtitle="Add your first one above, or run the seed script for a starter bank." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((q) => (
            <Card key={q.id}>
              <p className="text-sm italic text-neutral-200">&ldquo;{q.text}&rdquo;</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  {q.author && <span>— {q.author}</span>}
                  {q.category && <Badge>{q.category}</Badge>}
                </div>
                <form action={deleteQuote}>
                  <input type="hidden" name="id" value={q.id} />
                  <button className="text-xs text-red-500 hover:text-red-400" type="submit">
                    remove
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
