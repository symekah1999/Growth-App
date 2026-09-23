import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader, Card, Input, Textarea, Button } from "@/components/ui";
import { updateEntry } from "../actions";

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id)))
    .limit(1);

  if (!entry) notFound();

  const updateWithId = updateEntry.bind(null, id);

  return (
    <div>
      <PageHeader title="Edit entry" />
      <Card>
        <form action={updateWithId} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input name="title" defaultValue={entry.title} placeholder="Title" />
            <Input type="date" name="entryDate" defaultValue={entry.entryDate} />
          </div>
          <Textarea name="body" defaultValue={entry.body} rows={8} required />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="mood" defaultValue={entry.mood ?? ""} placeholder="Mood" />
            <Input name="tags" defaultValue={entry.tags.join(", ")} placeholder="Tags, comma separated" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
