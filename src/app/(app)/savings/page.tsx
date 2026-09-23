import { db } from "@/db";
import { savingsContributions, savingsPlans } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, desc, eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Input, Textarea, Button, ProgressBar, Badge } from "@/components/ui";
import { createPlan, addContribution, archivePlan, deletePlan } from "./actions";
import { addDaysISO, currency, daysBetween, formatDate, todayISO, toISODate } from "@/lib/utils";
import { monthsToTarget } from "@/lib/finance";
import { TrendLine } from "@/components/charts/TrendLine";

export default async function SavingsPage() {
  const user = await requireUser();

  const plans = await db
    .select()
    .from(savingsPlans)
    .where(and(eq(savingsPlans.userId, user.id), eq(savingsPlans.archived, false)))
    .orderBy(desc(savingsPlans.createdAt));

  const plansWithData = await Promise.all(
    plans.map(async (p) => {
      const contributions = await db
        .select()
        .from(savingsContributions)
        .where(eq(savingsContributions.planId, p.id))
        .orderBy(desc(savingsContributions.contributedOn));
      const total = contributions.reduce((s, c) => s + Number(c.amount), 0);

      const last90 = contributions.filter((c) => {
        const days = (Date.now() - new Date(c.contributedOn).getTime()) / 86400000;
        return days <= 90;
      });
      const avgMonthly = last90.length > 0 ? (last90.reduce((s, c) => s + Number(c.amount), 0) / 3) : 0;

      return { plan: p, contributions, total, avgMonthly };
    }),
  );

  return (
    <div>
      <PageHeader title="Savings" subtitle="Build and track progress toward specific savings goals." />

      <Card className="mb-6">
        <form action={createPlan} className="space-y-3">
          <Input name="name" placeholder="Plan name (e.g. Emergency fund)" required />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input type="number" step="0.01" name="targetAmount" placeholder="Target amount" required />
            <Input name="currency" defaultValue="KES" placeholder="Currency" />
            <Input type="date" name="targetDate" />
          </div>
          <Textarea name="notes" placeholder="Notes (optional)" rows={2} />
          <div className="flex justify-end">
            <Button type="submit">Create plan</Button>
          </div>
        </form>
      </Card>

      {plansWithData.length === 0 ? (
        <EmptyState title="No savings plans yet" subtitle="Create your first one above." />
      ) : (
        <div className="space-y-4">
          {plansWithData.map(({ plan, contributions, total, avgMonthly }) => {
            const target = Number(plan.targetAmount);
            const pct = target > 0 ? Math.min(100, (total / target) * 100) : 0;
            const monthsLeft = monthsToTarget(total, target, avgMonthly);

            // cumulative balance over time, oldest first
            let running = 0;
            const series = [...contributions]
              .reverse()
              .map((c) => {
                running += Number(c.amount);
                return { label: formatDate(c.contributedOn, { month: "short", day: "numeric" }), value: running };
              });

            // pacing against the target date: where a steady saver would be today
            const today = todayISO();
            let paceNote: string | null = null;
            if (plan.targetDate && pct < 100) {
              const start = toISODate(plan.createdAt);
              const totalDays = Math.max(1, daysBetween(start, plan.targetDate));
              const elapsed = Math.min(totalDays, Math.max(0, daysBetween(start, today)));
              const expectedAmount = (elapsed / totalDays) * target;
              const daysLeft = daysBetween(today, plan.targetDate);
              const monthsToDeadline = Math.max(daysLeft / 30.4, 0.5);
              const needed = (target - total) / monthsToDeadline;
              if (daysLeft < 0) paceNote = `Target date passed — ${currency(target - total, plan.currency)} still to go.`;
              else if (total >= expectedAmount * 0.95)
                paceNote = `On pace for ${formatDate(plan.targetDate)}. Keep saving about ${currency(needed, plan.currency)}/month.`;
              else
                paceNote = `Behind pace for ${formatDate(plan.targetDate)} — you'd need about ${currency(needed, plan.currency)}/month from now.`;
            }
            const projectedDate =
              avgMonthly > 0 && Number.isFinite(monthsLeft) && monthsLeft > 0 ? addDaysISO(today, Math.round(monthsLeft * 30.4)) : null;

            return (
              <Card key={plan.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-neutral-100">{plan.name}</p>
                    {plan.notes && <p className="text-sm text-neutral-500">{plan.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <form action={archivePlan}>
                      <input type="hidden" name="id" value={plan.id} />
                      <button className="text-xs text-neutral-500 hover:text-neutral-300" type="submit">
                        archive
                      </button>
                    </form>
                    <form action={deletePlan}>
                      <input type="hidden" name="id" value={plan.id} />
                      <button className="text-xs text-red-500 hover:text-red-400" type="submit">
                        delete
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar value={pct} className="flex-1" />
                  <span className="whitespace-nowrap text-sm text-neutral-400">
                    {currency(total, plan.currency)} / {currency(target, plan.currency)}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500">
                  {plan.targetDate && <Badge>target {formatDate(plan.targetDate)}</Badge>}
                  {avgMonthly > 0 && Number.isFinite(monthsLeft) && (
                    <Badge>
                      ~{monthsLeft} mo left at {currency(avgMonthly, plan.currency)}/mo pace
                    </Badge>
                  )}
                  <Badge>{contributions.length} contributions</Badge>
                  {projectedDate && <Badge>projected finish {formatDate(projectedDate)}</Badge>}
                  {pct >= 100 && <Badge className="border-emerald-800 text-emerald-300">🎉 target reached</Badge>}
                </div>

                {paceNote && <p className="mt-2 text-xs text-neutral-400">{paceNote}</p>}

                {series.length >= 2 && (
                  <div className="mt-4">
                    <TrendLine
                      data={series}
                      format="currency"
                      currencyCode={plan.currency}
                      referenceY={target}
                      referenceLabel="target"
                      domain={[0, Math.max(target, running) * 1.05]}
                      seriesName="Saved"
                      color="#14b8a6"
                      height={160}
                    />
                  </div>
                )}

                <form action={addContribution} className="mt-4 grid gap-2 sm:grid-cols-[auto_auto_1fr_auto]">
                  <input type="hidden" name="planId" value={plan.id} />
                  <Input type="number" step="0.01" name="amount" placeholder="Amount" required className="sm:w-32" />
                  <Input type="date" name="contributedOn" className="sm:w-40" />
                  <Input name="note" placeholder="Note (optional)" />
                  <Button type="submit" variant="ghost">
                    Add
                  </Button>
                </form>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
