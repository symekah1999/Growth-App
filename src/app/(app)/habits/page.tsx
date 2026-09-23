import { db } from "@/db";
import { habitLogs, habits } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, desc, eq, gte } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Input, Textarea, Button, Select } from "@/components/ui";
import { createHabit, toggleTodayLog, archiveHabit, deleteHabit } from "./actions";
import { addDaysISO, todayISO } from "@/lib/utils";
import { computeStreaks } from "@/lib/streaks";
import { DayHeatmap } from "@/components/charts/DayHeatmap";

const DAYS_BACK = 70;
const HEATMAP_DAYS = 182; // ~26 weeks

export default async function HabitsPage() {
  const user = await requireUser();
  const today = todayISO();

  const activeHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, user.id), eq(habits.archived, false)))
    .orderBy(desc(habits.createdAt));

  const sinceISO = addDaysISO(today, -(HEATMAP_DAYS - 1));

  const habitsWithData = await Promise.all(
    activeHabits.map(async (h) => {
      const logs = await db
        .select()
        .from(habitLogs)
        .where(and(eq(habitLogs.habitId, h.id), gte(habitLogs.logDate, sinceISO)));
      const logDates = new Set(logs.map((l) => l.logDate));
      const { current, longest } = computeStreaks([...logDates].sort().reverse());
      return { habit: h, logDates, current, longest };
    }),
  );

  // Consistency heatmap: share of active habits done each day (only counting habits that existed that day)
  const heatCells = Array.from({ length: HEATMAP_DAYS }, (_, i) => {
    const date = addDaysISO(sinceISO, i);
    const existing = habitsWithData.filter((h) => h.habit.createdAt.toISOString().slice(0, 10) <= date);
    const done = existing.filter((h) => h.logDates.has(date)).length;
    const value = existing.length > 0 ? done / existing.length : 0;
    return {
      date,
      value,
      detail: existing.length === 0 ? "No habits yet" : `${done} of ${existing.length} habit${existing.length === 1 ? "" : "s"} done`,
    };
  });
  const last30 = heatCells.slice(-30).filter((c) => c.detail !== "No habits yet");
  const avg30 = last30.length ? Math.round((last30.reduce((s, c) => s + c.value, 0) / last30.length) * 100) : 0;
  const perfectDays = heatCells.filter((c) => c.value === 1).length;

  // build last DAYS_BACK day columns (oldest -> newest)
  const days: string[] = Array.from({ length: DAYS_BACK }, (_, i) => addDaysISO(today, i - (DAYS_BACK - 1)));

  return (
    <div>
      <PageHeader title="Habits" subtitle="Small consistent actions, tracked daily." />

      <Card className="mb-6">
        <form action={createHabit} className="space-y-3">
          <Input name="name" placeholder="Habit name (e.g. Read 20 minutes)" required />
          <Textarea name="description" placeholder="Notes (optional)" rows={2} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Select name="frequency" defaultValue="daily">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </Select>
            <Input type="number" name="targetPerWeek" defaultValue={7} min={1} max={7} placeholder="Times / week" />
            <input type="color" name="color" defaultValue="#6366f1" className="h-10 w-full rounded-lg border border-neutral-700 bg-neutral-800" />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add habit</Button>
          </div>
        </form>
      </Card>

      {habitsWithData.length > 0 && (
        <Card className="mb-6">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-medium text-neutral-300">Consistency — last 26 weeks</h2>
            <div className="flex gap-4 text-xs text-neutral-400">
              <span>
                <span className="font-semibold text-neutral-100">{avg30}%</span> avg, last 30 days
              </span>
              <span>
                <span className="font-semibold text-neutral-100">{perfectDays}</span> perfect days
              </span>
            </div>
          </div>
          <DayHeatmap cells={heatCells} emptyLabel="none" />
        </Card>
      )}

      {habitsWithData.length === 0 ? (
        <EmptyState title="No habits yet" subtitle="Add one above to start building your streak." />
      ) : (
        <div className="space-y-3">
          {habitsWithData.map(({ habit, logDates, current, longest }) => {
            const loggedToday = logDates.has(today);
            return (
              <Card key={habit.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
                      <span className="font-medium text-neutral-100">{habit.name}</span>
                    </div>
                    {habit.description && <p className="mt-1 text-sm text-neutral-500">{habit.description}</p>}
                    <p className="mt-1 text-xs text-neutral-500">
                      🔥 {current}-day streak &middot; best {longest} &middot; target {habit.targetPerWeek}x/week
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <form action={toggleTodayLog}>
                      <input type="hidden" name="habitId" value={habit.id} />
                      <input type="hidden" name="isLogged" value={String(loggedToday)} />
                      <Button type="submit" variant={loggedToday ? "primary" : "ghost"}>
                        {loggedToday ? "Done today ✓" : "Mark today"}
                      </Button>
                    </form>
                    <form action={archiveHabit}>
                      <input type="hidden" name="id" value={habit.id} />
                      <button className="text-xs text-neutral-500 hover:text-neutral-300" type="submit">
                        archive
                      </button>
                    </form>
                    <form action={deleteHabit}>
                      <input type="hidden" name="id" value={habit.id} />
                      <button className="text-xs text-red-500 hover:text-red-400" type="submit">
                        delete
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-[3px]">
                  {days.map((d) => (
                    <div
                      key={d}
                      title={d}
                      className="h-3 w-3 rounded-sm"
                      style={{
                        backgroundColor: logDates.has(d) ? habit.color : "rgba(255,255,255,0.06)",
                      }}
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
