import { db } from "@/db";
import { debts } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, desc, eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Input, Button, Badge, Select } from "@/components/ui";
import { createDebt, recordPayment, archiveDebt, deleteDebt } from "./actions";
import { currency } from "@/lib/utils";
import { simulatePayoff } from "@/lib/finance";

export default async function DebtsPage({
  searchParams,
}: {
  searchParams: Promise<{ extra?: string; strategy?: string }>;
}) {
  const user = await requireUser();
  const { extra, strategy } = await searchParams;

  const rows = await db
    .select()
    .from(debts)
    .where(and(eq(debts.userId, user.id), eq(debts.archived, false)))
    .orderBy(desc(debts.createdAt));

  const totalBalance = rows.reduce((s, d) => s + Number(d.balance), 0);
  const totalMinPayment = rows.reduce((s, d) => s + Number(d.minPayment), 0);

  const extraBudget = Number(extra ?? 0) || 0;
  const chosenStrategy = strategy === "avalanche" ? "avalanche" : "snowball";

  const plan =
    rows.length > 0
      ? simulatePayoff(
          rows.map((d) => ({
            id: d.id,
            name: d.name,
            balance: Number(d.balance),
            interestRateApr: Number(d.interestRateApr),
            minPayment: Number(d.minPayment),
          })),
          extraBudget,
          chosenStrategy,
        )
      : null;

  return (
    <div>
      <PageHeader
        title="Debt Payoff"
        subtitle="Every active debt, its balance, and a plan to kill it."
        action={
          <div className="text-right">
            <p className="text-xs text-neutral-500">Total balance</p>
            <p className="text-lg font-semibold text-neutral-100">{currency(totalBalance)}</p>
          </div>
        }
      />

      <Card className="mb-6">
        <form action={createDebt} className="space-y-3">
          <Input name="name" placeholder="Debt name (e.g. Visa card, Student loan)" required />
          <div className="grid gap-3 sm:grid-cols-4">
            <Input type="number" step="0.01" name="principal" placeholder="Original amount" required />
            <Input type="number" step="0.01" name="balance" placeholder="Current balance (defaults to original)" />
            <Input type="number" step="0.01" name="interestRateApr" placeholder="APR %" />
            <Input type="number" step="0.01" name="minPayment" placeholder="Min payment / mo" />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add debt</Button>
          </div>
        </form>
      </Card>

      {rows.length === 0 ? (
        <EmptyState title="No debts logged" subtitle="If you're debt-free, nothing to do here. Otherwise, add one above." />
      ) : (
        <>
          <div className="mb-6 space-y-3">
            {rows.map((d) => (
              <Card key={d.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-neutral-100">{d.name}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-500">
                      <Badge>{currency(d.balance, d.currency)} remaining</Badge>
                      <Badge>{Number(d.interestRateApr)}% APR</Badge>
                      <Badge>min {currency(d.minPayment, d.currency)}/mo</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <form action={archiveDebt}>
                      <input type="hidden" name="id" value={d.id} />
                      <button className="text-xs text-neutral-500 hover:text-neutral-300" type="submit">
                        archive
                      </button>
                    </form>
                    <form action={deleteDebt}>
                      <input type="hidden" name="id" value={d.id} />
                      <button className="text-xs text-red-500 hover:text-red-400" type="submit">
                        delete
                      </button>
                    </form>
                  </div>
                </div>
                <form action={recordPayment} className="mt-3 grid gap-2 sm:grid-cols-[auto_auto_1fr_auto]">
                  <input type="hidden" name="debtId" value={d.id} />
                  <Input type="number" step="0.01" name="amount" placeholder="Payment amount" required className="sm:w-32" />
                  <Input type="date" name="paidOn" className="sm:w-40" />
                  <Input name="note" placeholder="Note (optional)" />
                  <Button type="submit" variant="ghost">
                    Log payment
                  </Button>
                </form>
              </Card>
            ))}
          </div>

          <Card>
            <h2 className="mb-1 text-sm font-medium text-neutral-300">Payoff planner</h2>
            <p className="mb-4 text-xs text-neutral-500">
              Your minimums total {currency(totalMinPayment)}/mo. Add extra budget on top to see how fast you&apos;re debt-free.
            </p>
            <form className="mb-4 flex flex-wrap items-end gap-3" action="/debts">
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Extra monthly budget</label>
                <Input type="number" step="0.01" name="extra" defaultValue={extraBudget || ""} className="w-40" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Strategy</label>
                <Select name="strategy" defaultValue={chosenStrategy} className="w-44">
                  <option value="snowball">Snowball (smallest balance first)</option>
                  <option value="avalanche">Avalanche (highest interest first)</option>
                </Select>
              </div>
              <Button type="submit" variant="ghost">
                Recalculate
              </Button>
            </form>

            {plan && (
              <div>
                <p className="mb-2 text-sm text-neutral-300">
                  Debt-free in <span className="font-semibold text-neutral-100">{plan.totalMonths} months</span>, paying{" "}
                  <span className="font-semibold text-neutral-100">{currency(plan.totalInterest)}</span> in total interest.
                </p>
                <ol className="space-y-1.5">
                  {plan.order.map((step, i) => (
                    <li key={step.id} className="flex items-center justify-between rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                      <span className="text-neutral-300">
                        {i + 1}. {step.name}
                      </span>
                      <span className="text-xs text-neutral-500">
                        paid off in {step.monthsToPayoff} mo &middot; {currency(step.totalInterestPaid)} interest
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
