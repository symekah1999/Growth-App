import { requireUser } from "@/lib/auth";
import { PageHeader, Card, Badge } from "@/components/ui";
import { achievements, lifeAreas, lifeScore, loadProgressData, weeklyReview } from "@/lib/progress";
import { TrendLine } from "@/components/charts/TrendLine";
import { currency, formatDate } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import Link from "next/link";

function scoreWord(score: number) {
  if (score >= 85) return "Thriving";
  if (score >= 70) return "Strong week";
  if (score >= 50) return "Steady";
  if (score >= 30) return "Room to grow";
  return "Fresh start";
}

export default async function ProgressPage() {
  const user = await requireUser();
  const data = await loadProgressData(user.id);
  const score = lifeScore(data);
  const badges = achievements(data);
  const review = weeklyReview(data);
  const areas = lifeAreas(data);

  const earned = badges.filter((b) => b.earned);
  const nextUp = badges
    .filter((b) => !b.earned && b.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);
  const groups = [...new Set(badges.map((b) => b.group))];
  const history = score.history.filter((h) => h.value !== null) as { label: string; value: number }[];
  const neglected = areas.filter((a) => a.active === 0 && a.area !== "general").map((a) => a.area);

  return (
    <div>
      <PageHeader title="Progress" subtitle="Your life score, weekly review, balance across life areas, and achievements earned." />

      {/* LIFE SCORE */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
        <Card className="bg-gradient-to-br from-indigo-950/40 via-neutral-900/60 to-neutral-900/40">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-400">Life score · last 7 days</p>
          {score.score === null ? (
            <p className="mt-3 text-sm text-neutral-400">
              Start logging habits, journaling, or setting goals with deadlines — your score appears once there&apos;s something to measure.
            </p>
          ) : (
            <>
              <div className="mt-2 flex items-end gap-3">
                <p className="text-6xl font-semibold tracking-tight text-neutral-50">{score.score}</p>
                <div className="pb-2">
                  <p className="text-sm font-medium text-neutral-200">{scoreWord(score.score)}</p>
                  {score.delta !== null && (
                    <p className={`flex items-center gap-0.5 text-xs ${score.delta > 0 ? "text-[#4ade4a]" : score.delta < 0 ? "text-[#ec835a]" : "text-neutral-400"}`}>
                      {score.delta > 0 ? <ArrowUpRight size={13} /> : score.delta < 0 ? <ArrowDownRight size={13} /> : <Minus size={13} />}
                      {score.delta > 0 ? "+" : ""}
                      {score.delta} vs last week
                    </p>
                  )}
                </div>
              </div>
              <ul className="mt-4 space-y-2.5">
                {score.components.map((c) => (
                  <li key={c.key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300">{c.label}</span>
                      <span className="text-neutral-500">
                        {c.detail} · <span className="text-neutral-300">{Math.round((c.score ?? 0) * 100)}%</span>
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-800">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.round((c.score ?? 0) * 100)}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card>
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-neutral-300">Life score — last 8 weeks</h2>
            <span className="text-xs text-neutral-500">each point = the 7 days ending that week</span>
          </div>
          {history.length >= 2 ? (
            <TrendLine data={history} format="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} seriesName="Life score" height={220} />
          ) : (
            <p className="py-10 text-center text-sm text-neutral-500">Your trend line appears after a couple of weeks of activity.</p>
          )}
        </Card>
      </div>

      {/* WEEKLY REVIEW */}
      <Card className="mb-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-neutral-300">Weekly review</h2>
          <span className="text-xs text-neutral-500">
            {formatDate(review.start, { month: "short", day: "numeric" })} – {formatDate(review.end, { month: "short", day: "numeric" })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={review.habitWeek.reduce((s, h) => s + h.done, 0)} label="habit check-ins" />
          <Stat value={review.journalDays} label="days journaled" />
          <Stat value={review.todosDone} label="to-dos completed" />
          <Stat value={review.goalsCompleted.length} label="goals completed" />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-400">What went well</p>
            <ul className="space-y-1.5 text-sm text-neutral-300">
              {review.habitWeek
                .filter((h) => h.done >= h.target)
                .map((h) => (
                  <li key={h.name}>✓ Hit your target for <span className="text-neutral-100">{h.name}</span> ({h.done}/{h.target})</li>
                ))}
              {review.goalsCompleted.map((g) => (
                <li key={g.id}>🏁 Completed <span className="text-neutral-100">{g.title}</span></li>
              ))}
              {review.recoveryDays.map((r) => (
                <li key={r.name}>🌿 {r.name}: day {r.days}</li>
              ))}
              {review.savedByCurrency.map(([cur, amt]) => (
                <li key={cur}>🪙 Saved {currency(amt, cur)}</li>
              ))}
              {review.paidByCurrency.map(([cur, amt]) => (
                <li key={cur}>✂️ Paid {currency(amt, cur)} toward debt</li>
              ))}
              {review.journalDays >= 5 && <li>✍️ Journaled {review.journalDays} of 7 days</li>}
              {review.habitWeek.every((h) => h.done < h.target) &&
                review.goalsCompleted.length === 0 &&
                review.recoveryDays.length === 0 &&
                review.savedByCurrency.length === 0 &&
                review.journalDays < 5 && <li className="text-neutral-500">A quiet week — next week is a fresh page.</li>}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#fab219]">Needs attention</p>
            <ul className="space-y-1.5 text-sm text-neutral-300">
              {review.goalsOverdue.map((g) => (
                <li key={g.id}>
                  ⚠️ <Link href={`/goals/${g.id}`} className="text-neutral-100 hover:underline">{g.title}</Link> is past its deadline ({g.progress}%)
                </li>
              ))}
              {review.habitWeek
                .filter((h) => h.done === 0)
                .map((h) => (
                  <li key={h.name}>• No check-ins for <span className="text-neutral-100">{h.name}</span> this week</li>
                ))}
              {review.todosOverdue > 0 && (
                <li>
                  • <Link href="/todos" className="text-neutral-100 hover:underline">{review.todosOverdue} daily to-do{review.todosOverdue === 1 ? "" : "s"}</Link> left undone from past days
                </li>
              )}
              {neglected.length > 0 && <li>• No active goals in: {neglected.join(", ")}</li>}
              {review.goalsOverdue.length === 0 &&
                review.habitWeek.every((h) => h.done > 0) &&
                review.todosOverdue === 0 &&
                neglected.length === 0 && <li className="text-neutral-500">Nothing slipping. Well done.</li>}
            </ul>
          </div>
        </div>

        {(review.goalsDueSoon.length > 0 || review.milestonesDueSoon.length > 0) && (
          <div className="mt-5 border-t border-neutral-800 pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-indigo-400">Coming up in the next 7 days</p>
            <ul className="space-y-1.5 text-sm text-neutral-300">
              {review.goalsDueSoon.map((g) => (
                <li key={g.id}>
                  🎯 Goal deadline: <Link href={`/goals/${g.id}`} className="text-neutral-100 hover:underline">{g.title}</Link> ·{" "}
                  {formatDate(g.targetDate!)} ({g.progress}%)
                </li>
              ))}
              {review.milestonesDueSoon.map((m, i) => (
                <li key={i} className={m.overdue ? "text-[#f07070]" : undefined}>
                  🪜 {m.title} <span className="text-neutral-500">({m.goal})</span> · {m.overdue ? "overdue since " : ""}
                  {formatDate(m.dueDate)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* LIFE AREAS */}
      <Card className="mb-6">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-neutral-300">Life areas</h2>
          <span className="text-xs text-neutral-500">average progress of active goals in each area</span>
        </div>
        <ul className="space-y-3">
          {areas.map((a) => (
            <li key={a.area} className="grid grid-cols-[110px_1fr_auto] items-center gap-3">
              <span className="text-sm capitalize text-neutral-300">{a.area}</span>
              {a.avgProgress === null ? (
                <span className="text-xs text-neutral-600">no active goals</span>
              ) : (
                <div className="h-2.5 overflow-hidden rounded-full bg-neutral-800">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.max(2, a.avgProgress)}%` }} />
                </div>
              )}
              <span className="whitespace-nowrap text-right text-xs text-neutral-500">
                {a.avgProgress !== null && <span className="mr-2 font-medium text-neutral-200">{a.avgProgress}%</span>}
                {a.active} active · {a.completed} done
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* ACHIEVEMENTS */}
      <Card>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-neutral-300">Achievements</h2>
          <Badge className="border-indigo-800 text-indigo-300">
            {earned.length} / {badges.length} earned
          </Badge>
        </div>

        {nextUp.length > 0 && (
          <div className="mb-5 rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
            <p className="mb-2 text-xs font-medium text-neutral-500">Closest to unlocking</p>
            <ul className="space-y-2">
              {nextUp.map((b) => (
                <li key={b.id} className="flex items-center gap-3">
                  <span className="text-lg grayscale">{b.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-200">{b.title}</span>
                      <span className="text-neutral-500">{b.progressLabel}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-800">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${b.progress * 100}%` }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{g}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {badges
                  .filter((b) => b.group === g)
                  .map((b) => (
                    <div
                      key={b.id}
                      className={`rounded-xl border p-3 ${
                        b.earned ? "border-indigo-800/70 bg-indigo-950/30" : "border-neutral-800 bg-neutral-900/40"
                      }`}
                      title={b.description}
                    >
                      <div className={`text-2xl ${b.earned ? "" : "opacity-30 grayscale"}`}>{b.icon}</div>
                      <p className={`mt-1.5 text-sm font-medium ${b.earned ? "text-neutral-100" : "text-neutral-400"}`}>{b.title}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">{b.description}</p>
                      {!b.earned && (
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-800">
                          <div className="h-full rounded-full bg-neutral-500" style={{ width: `${b.progress * 100}%` }} />
                        </div>
                      )}
                      {b.earned && <p className="mt-1.5 text-[11px] font-medium text-indigo-300">Unlocked</p>}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3">
      <p className="text-2xl font-semibold text-neutral-50">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
