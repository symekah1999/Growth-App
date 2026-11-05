import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { lifeLessons } from "@/db/schema-lessons";
import { requireUser } from "@/lib/auth";
import { lifeScore, loadProgressData } from "@/lib/progress";
import { loadGratitude } from "@/lib/gratitude";
import { categoryCounts, correlations, weekdayCounts, weeklyBuckets } from "@/lib/trends";
import { addDaysISO, todayISO } from "@/lib/utils";
import { and, eq, gte } from "drizzle-orm";
import { Card, PageHeader } from "@/components/ui";
import { TrendLine } from "@/components/charts/TrendLine";
import { WeeklyBars } from "@/components/charts/WeeklyBars";
import { photoUrl } from "@/lib/images";
import { Lightbulb } from "lucide-react";

export default async function TrendsPage() {
  const user = await requireUser();
  const today = todayISO();
  const since = addDaysISO(today, -7 * 12);

  const data = await loadProgressData(user.id);
  const [gratitudeRows, lessonRows, moods] = await Promise.all([
    loadGratitude(user.id, 3000),
    db
      .select({ learnedOn: lifeLessons.learnedOn })
      .from(lifeLessons)
      .where(and(eq(lifeLessons.userId, user.id), gte(lifeLessons.learnedOn, since)))
      .catch(() => [] as { learnedOn: string }[]),
    db
      .select({ entryDate: journalEntries.entryDate, mood: journalEntries.mood })
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, user.id), gte(journalEntries.entryDate, since))),
  ]);

  const gratitude = gratitudeRows ?? [];
  const weeks = weeklyBuckets({
    data,
    gratitude,
    lessonDates: lessonRows.map((l) => l.learnedOn),
    moods,
    today,
  });
  const insights = correlations(weeks);
  const score = lifeScore(data, today);
  const scoreSeries = score.history.map((h) => ({ label: h.label, value: h.value }));
  const moodSeries = weeks.map((w) => ({ label: w.label, value: w.mood }));
  const habitSeries = weeks.map((w) => ({ label: w.label, value: w.habitPct }));
  const byWeekday = weekdayCounts(data.logRows.filter((l) => l.logDate >= since).map((l) => l.logDate));
  const maxDay = Math.max(1, ...byWeekday.map((d) => d.count));
  const cats = categoryCounts(gratitude.filter((g) => g.entryDate >= since));
  const maxCat = Math.max(1, ...cats.map((c) => c.count));
  const hasAny = weeks.some((w) => w.habitPct !== null || w.journalDays || w.gratitudeItems || w.lessons || w.todosDone);

  return (
    <div>
      <PageHeader image={photoUrl("progress")} title="Trends" subtitle="The last 12 weeks, week by week. Each point is a rolling 7-day window." />

      {!hasAny && (
        <Card className="mb-4">
          <p className="text-sm text-neutral-400">Nothing to chart yet. Use habits, the journal and gratitude for a couple of weeks and your trends will appear here.</p>
        </Card>
      )}

      <Card className="mb-4">
        <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-neutral-100">
          <Lightbulb size={14} className="text-amber-300" /> What moves together
        </h2>
        {insights.length ? (
          <ul className="mt-2 space-y-2">
            {insights.map((t) => (
              <li key={t} className="text-sm leading-relaxed text-neutral-300">{t}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-neutral-500">Patterns show up once you have at least 6 weeks of data and a clear link between two things.</p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">Life score · 8 weeks</h2>
          <TrendLine data={scoreSeries} format="number" domain={[0, 100]} seriesName="Life score" color="#a78bfa" height={170} />
        </Card>
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">Habit completion</h2>
          <TrendLine data={habitSeries} format="percent" domain={[0, 100]} seriesName="Habit completion" color="#34d399" height={170} />
        </Card>
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">Mood from journal entries</h2>
          <TrendLine data={moodSeries} format="mood" domain={[-2, 2]} ticks={[-2, -1, 0, 1, 2]} seriesName="Mood" color="#38bdf8" height={170} />
        </Card>
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">Journal days per week</h2>
          <WeeklyBars data={weeks.map((w) => ({ label: w.label, value: w.journalDays }))} seriesName="Days journaled" color="#38bdf8" />
        </Card>
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">Gratitude items per week</h2>
          <WeeklyBars data={weeks.map((w) => ({ label: w.label, value: w.gratitudeItems }))} seriesName="Items" color="#fb7185" />
        </Card>
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">To-dos done per week</h2>
          <WeeklyBars data={weeks.map((w) => ({ label: w.label, value: w.todosDone }))} seriesName="Done" color="#fbbf24" />
        </Card>
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">Lessons logged per week</h2>
          <WeeklyBars data={weeks.map((w) => ({ label: w.label, value: w.lessons }))} seriesName="Lessons" color="#f59e0b" />
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-neutral-100">Habit check-ins by weekday</h2>
          <div className="space-y-1.5">
            {byWeekday.map((d) => (
              <div key={d.day} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-neutral-500">{d.day}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-800">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(d.count / maxDay) * 100}%` }} />
                </div>
                <span className="w-8 text-right tabular-nums text-neutral-400">{d.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {cats.length > 0 && (
        <Card className="mt-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-100">What you&apos;re grateful for · by category</h2>
          <div className="space-y-1.5">
            {cats.map((c) => (
              <div key={c.category} className="flex items-center gap-2 text-xs">
                <span className="w-28 truncate capitalize text-neutral-400">{c.category}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-800">
                  <div className="h-full rounded-full bg-rose-500" style={{ width: `${(c.count / maxCat) * 100}%` }} />
                </div>
                <span className="w-8 text-right tabular-nums text-neutral-400">{c.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
