import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { lifeScore, loadProgressData, weeklyReview } from "@/lib/progress";
import { averageMood, observations, weekRange } from "@/lib/review";
import { loadGratitude } from "@/lib/gratitude";
import { lifeLessons } from "@/db/schema-lessons";
import { currency, formatDate, todayISO } from "@/lib/utils";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import Link from "next/link";
import { Button, Card, PageHeader, ProgressBar, Textarea } from "@/components/ui";
import { ShowMore } from "@/components/ShowMore";
import { photoUrl } from "@/lib/images";
import { saveReview } from "./actions";
import { AlertTriangle, CalendarCheck, Compass, Trophy } from "lucide-react";

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { saved } = await searchParams;
  const today = todayISO();
  const { start, prevStart } = weekRange(today);

  const data = await loadProgressData(user.id);
  const review = weeklyReview(data, today);
  const score = lifeScore(data, today);

  const [gratitudeRows, lessonRows, moodRows, pastReviews] = await Promise.all([
    loadGratitude(user.id, 600),
    db
      .select({ learnedOn: lifeLessons.learnedOn })
      .from(lifeLessons)
      .where(and(eq(lifeLessons.userId, user.id), gte(lifeLessons.learnedOn, start)))
      .catch(() => [] as { learnedOn: string }[]),
    db
      .select({ entryDate: journalEntries.entryDate, mood: journalEntries.mood })
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, user.id), gte(journalEntries.entryDate, prevStart))),
    db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, user.id), sql`'weekly-review' = ANY(${journalEntries.tags})`))
      .orderBy(desc(journalEntries.entryDate), desc(journalEntries.createdAt))
      .limit(30),
  ]);

  const gThisWeek = (gratitudeRows ?? []).filter((g) => g.entryDate >= start);
  const gratitudeDays = new Set(gThisWeek.map((g) => g.entryDate)).size;
  const obs = observations({
    review,
    score,
    gratitudeCount: gThisWeek.length,
    gratitudeDays,
    lessonCount: lessonRows.length,
    moodNow: averageMood(moodRows, start, today),
    moodBefore: averageMood(moodRows, prevStart, weekRange(today).prevEnd),
  });

  const habitDone = review.habitWeek.reduce((s, h) => s + Math.min(h.done, h.target), 0);
  const habitTarget = review.habitWeek.reduce((s, h) => s + h.target, 0);
  const habitPct = habitTarget ? Math.round((habitDone / habitTarget) * 100) : null;

  const last = pastReviews[0];
  const lastFocus = last ? /Focus for next week:\n([\s\S]*)$/.exec(last.body)?.[1]?.trim() : undefined;
  const reviewedThisWeek = last ? last.entryDate >= start : false;

  const groups = {
    win: obs.filter((o) => o.kind === "win"),
    watch: obs.filter((o) => o.kind === "watch"),
    tip: obs.filter((o) => o.kind === "tip"),
  };

  const stats = [
    { label: "Life score", value: score.score === null ? "—" : String(score.score), sub: score.delta === null ? undefined : `${score.delta > 0 ? "+" : ""}${score.delta} vs last wk` },
    { label: "Habits", value: habitPct === null ? "—" : `${habitPct}%`, sub: habitTarget ? `${habitDone}/${habitTarget} check-ins` : undefined },
    { label: "To-dos done", value: String(review.todosDone) },
    { label: "Journal days", value: `${review.journalDays}/7` },
    { label: "Gratitude", value: String(gThisWeek.length), sub: `${gratitudeDays} days` },
    { label: "Lessons", value: String(lessonRows.length) },
  ];

  return (
    <div>
      <PageHeader
        image={photoUrl("progress")}
        eyebrow="Weekly review"
        title="How was your week?"
        subtitle={`${formatDate(start)} – ${formatDate(today)}. Look honestly, then decide what matters next.`}
        action={<Link href="/progress" className="rounded-lg bg-neutral-950/50 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900">Full progress →</Link>}
      />

      {saved && (
        <Card className="mb-4 border-emerald-800/60 bg-emerald-950/20">
          <p className="text-sm text-emerald-200">Review saved to your journal. Go and have a good week.</p>
        </Card>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-3 text-center">
            <p className="text-2xl font-semibold text-neutral-50">{s.value}</p>
            <p className="text-[11px] uppercase tracking-wide text-neutral-500">{s.label}</p>
            {s.sub && <p className="mt-0.5 text-[11px] text-neutral-500">{s.sub}</p>}
          </Card>
        ))}
      </div>

      {lastFocus && lastFocus !== "—" && (
        <Card className="mb-4 border-amber-900/40 bg-amber-950/10">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
            <Compass size={12} /> Your focus from last review ({formatDate(last!.entryDate)})
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm text-neutral-100">{lastFocus}</p>
          <p className="mt-1 text-xs text-neutral-500">Did you follow it?</p>
        </Card>
      )}

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Card className="border-emerald-900/40">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
            <Trophy size={14} /> Wins
          </h2>
          {groups.win.length === 0 ? (
            <p className="text-sm text-neutral-500">Log habits, to-dos and journal entries and your wins will appear here.</p>
          ) : (
            <ul className="space-y-2 text-sm text-neutral-200">
              {groups.win.map((o, i) => (
                <li key={i}>• {o.text}</li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="border-amber-900/40">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-300">
            <AlertTriangle size={14} /> Needs attention
          </h2>
          {groups.watch.length === 0 ? (
            <p className="text-sm text-neutral-500">Nothing is flashing red. Keep going.</p>
          ) : (
            <ul className="space-y-2 text-sm text-neutral-200">
              {groups.watch.map((o, i) => (
                <li key={i}>• {o.text}</li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="border-sky-900/40">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-sky-300">
            <CalendarCheck size={14} /> Coming up
          </h2>
          {groups.tip.length === 0 ? (
            <p className="text-sm text-neutral-500">Nothing due in the next 7 days.</p>
          ) : (
            <ul className="space-y-2 text-sm text-neutral-200">
              {groups.tip.map((o, i) => (
                <li key={i}>• {o.text}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-neutral-100">Habits this week</h2>
          {review.habitWeek.length === 0 ? (
            <p className="text-sm text-neutral-500">No habits yet.</p>
          ) : (
            <ul className="space-y-3">
              {review.habitWeek.map((h) => (
                <li key={h.name}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="text-neutral-200">{h.name}</span>
                    <span className="text-xs text-neutral-500">
                      {h.done}/{h.target}
                    </span>
                  </div>
                  <ProgressBar value={h.target ? (h.done / h.target) * 100 : 0} />
                </li>
              ))}
            </ul>
          )}
          {(review.savedByCurrency.length > 0 || review.paidByCurrency.length > 0) && (
            <div className="mt-4 border-t border-neutral-800 pt-3 text-xs text-neutral-400">
              {review.savedByCurrency.map(([cur, n]) => (
                <p key={"s" + cur}>Saved {currency(n, cur)}</p>
              ))}
              {review.paidByCurrency.map(([cur, n]) => (
                <p key={"p" + cur}>Paid toward debt {currency(n, cur)}</p>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold text-neutral-100">{reviewedThisWeek ? "Add to this week's review" : "Write your review"}</h2>
          <p className="mb-3 text-xs text-neutral-500">Saved to your Journal, tagged weekly-review. Next week it will remind you of your focus.</p>
          <form action={saveReview} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-neutral-300">What went well?</label>
              <Textarea name="wins" rows={3} placeholder="Wins, big or small…" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-300">What got in the way?</label>
              <Textarea name="blockers" rows={3} placeholder="Be honest, not harsh…" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-300">My focus for next week</label>
              <Textarea name="focus" rows={2} placeholder="The one or two things that matter most." />
            </div>
            <Button type="submit">Save review</Button>
          </form>
        </Card>
      </div>

      {pastReviews.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-neutral-50">Past reviews</h2>
          <ShowMore initial={4} label="Older reviews" className="grid gap-3 md:grid-cols-2">
            {pastReviews.map((r) => (
              <Card key={r.id}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">{formatDate(r.entryDate)}</p>
                <p className="line-clamp-6 whitespace-pre-wrap text-sm text-neutral-300">{r.body}</p>
              </Card>
            ))}
          </ShowMore>
        </div>
      )}
    </div>
  );
}
