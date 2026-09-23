import { db } from "@/db";
import { coreValues, mantras } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { asc, eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Input, Textarea, Button } from "@/components/ui";
import { addMantra, deleteMantra, addValue, deleteValue } from "./actions";

export default async function MantrasPage() {
  const user = await requireUser();

  const [mantraRows, valueRows] = await Promise.all([
    db.select().from(mantras).where(eq(mantras.userId, user.id)).orderBy(asc(mantras.sortOrder), asc(mantras.createdAt)),
    db.select().from(coreValues).where(eq(coreValues.userId, user.id)).orderBy(asc(coreValues.sortOrder), asc(coreValues.createdAt)),
  ]);

  return (
    <div>
      <PageHeader title="Mantras & Non-Negotiable Values" subtitle="The words you return to when it's hard to think straight." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-medium text-neutral-300">Mantras</h2>
          <Card className="mb-4">
            <form action={addMantra} className="flex gap-2">
              <Input name="text" placeholder="e.g. Discipline is a form of self-respect" required />
              <Button type="submit">Add</Button>
            </form>
          </Card>
          {mantraRows.length === 0 ? (
            <EmptyState title="No mantras yet" />
          ) : (
            <ul className="space-y-2">
              {mantraRows.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3">
                  <span className="text-sm italic text-neutral-200">&ldquo;{m.text}&rdquo;</span>
                  <form action={deleteMantra}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="text-xs text-red-500 hover:text-red-400" type="submit">
                      remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-neutral-300">Non-negotiable values</h2>
          <Card className="mb-4">
            <form action={addValue} className="space-y-2">
              <Input name="title" placeholder="Value (e.g. Integrity)" required />
              <Textarea name="description" placeholder="What this means to you, in practice" rows={2} />
              <div className="flex justify-end">
                <Button type="submit">Add</Button>
              </div>
            </form>
          </Card>
          {valueRows.length === 0 ? (
            <EmptyState title="No values recorded yet" />
          ) : (
            <ul className="space-y-2">
              {valueRows.map((v) => (
                <li key={v.id} className="rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-neutral-100">{v.title}</span>
                    <form action={deleteValue}>
                      <input type="hidden" name="id" value={v.id} />
                      <button className="text-xs text-red-500 hover:text-red-400" type="submit">
                        remove
                      </button>
                    </form>
                  </div>
                  {v.description && <p className="mt-1 text-sm text-neutral-500">{v.description}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
