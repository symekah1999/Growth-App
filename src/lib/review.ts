import type { ProgressData } from "@/lib/progress";
import { weeklyReview } from "@/lib/progress";
import { MOOD_SCORE } from "@/lib/mood";
import { addDaysISO } from "@/lib/utils";

export type Observation = { kind: "win" | "watch" | "tip"; text: string };

type Review = ReturnType<typeof weeklyReview>;

/** Average mood score (-2..2) of journal entries in [from, to], or null. */
export function averageMood(entries: { entryDate: string; mood: string | null }[], from: string, to: string): number | null {
  const scores = entries
    .filter((e) => e.entryDate >= from && e.entryDate <= to && e.mood && MOOD_SCORE[e.mood] !== undefined)
    .map((e) => MOOD_SCORE[e.mood as string]);
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
}

/** Plain-language observations about the week, built from the numbers. No AI call. */
export function observations(opts: {
  review: Review;
  score: { score: number | null; delta: number | null };
  gratitudeCount: number;
  gratitudeDays: number;
  lessonCount: number;
  moodNow: number | null;
  moodBefore: number | null;
}): Observation[] {
  const { review, score, gratitudeCount, gratitudeDays, lessonCount, moodNow, moodBefore } = opts;
  const out: Observation[] = [];

  if (score.score !== null && score.delta !== null) {
    if (score.delta >= 5) out.push({ kind: "win", text: `Your life score rose ${score.delta} points to ${score.score}. Whatever you did differently is working.` });
    else if (score.delta <= -5) out.push({ kind: "watch", text: `Your life score slipped ${Math.abs(score.delta)} points to ${score.score}. Look at what changed in your routine.` });
  }

  const habits = review.habitWeek.filter((h) => h.target > 0);
  const perfect = habits.filter((h) => h.done >= h.target);
  if (perfect.length) out.push({ kind: "win", text: `You hit your target on ${perfect.length} habit${perfect.length === 1 ? "" : "s"}: ${perfect.slice(0, 3).map((h) => h.name).join(", ")}.` });
  const weak = [...habits].sort((a, b) => a.done / a.target - b.done / b.target)[0];
  if (weak && weak.done / weak.target < 0.5) out.push({ kind: "watch", text: `“${weak.name}” got ${weak.done} of ${weak.target} check-ins. Make it smaller or attach it to something you already do.` });

  if (review.todosDone >= 5) out.push({ kind: "win", text: `You finished ${review.todosDone} to-dos this week.` });
  if (review.todosOverdue > 0) out.push({ kind: "watch", text: `${review.todosOverdue} daily to-do${review.todosOverdue === 1 ? " is" : "s are"} overdue. Do, move or delete each one.` });

  if (review.goalsCompleted.length) out.push({ kind: "win", text: `You completed ${review.goalsCompleted.length} goal${review.goalsCompleted.length === 1 ? "" : "s"}: ${review.goalsCompleted.map((g) => g.title).slice(0, 2).join(", ")}.` });
  if (review.goalsOverdue.length) out.push({ kind: "watch", text: `${review.goalsOverdue.length} goal${review.goalsOverdue.length === 1 ? " is" : "s are"} past the deadline. Re-date or recommit.` });
  if (review.goalsDueSoon.length) out.push({ kind: "tip", text: `Due in the next 7 days: ${review.goalsDueSoon.map((g) => g.title).slice(0, 3).join(", ")}.` });
  if (review.milestonesDueSoon.length) out.push({ kind: "tip", text: `${review.milestonesDueSoon.length} milestone${review.milestonesDueSoon.length === 1 ? "" : "s"} due soon, starting with “${review.milestonesDueSoon[0].title}”.` });

  if (review.journalDays >= 5) out.push({ kind: "win", text: `You journaled ${review.journalDays} days out of 7.` });
  else if (review.journalDays === 0) out.push({ kind: "tip", text: "No journal entries this week. Even three lines at night keep the thread." });

  if (gratitudeCount > 0) out.push({ kind: "win", text: `You named ${gratitudeCount} thing${gratitudeCount === 1 ? "" : "s"} to be thankful for across ${gratitudeDays} day${gratitudeDays === 1 ? "" : "s"}.` });
  else out.push({ kind: "tip", text: "No gratitude logged this week. Try three items tonight." });
  if (lessonCount > 0) out.push({ kind: "win", text: `${lessonCount} lesson${lessonCount === 1 ? "" : "s"} logged. Learning you write down is learning you keep.` });

  if (moodNow !== null && moodBefore !== null) {
    const d = moodNow - moodBefore;
    if (d >= 0.5) out.push({ kind: "win", text: "Your journal moods were better than last week." });
    else if (d <= -0.5) out.push({ kind: "watch", text: "Your journal moods were lower than last week. Be gentle with yourself and notice what drained you." });
  }

  for (const r of review.recoveryDays) if (r.days >= 7) out.push({ kind: "win", text: `${r.name}: ${r.days} days and counting.` });

  return out.slice(0, 10);
}

export function weekRange(today: string) {
  return { start: addDaysISO(today, -6), prevStart: addDaysISO(today, -13), prevEnd: addDaysISO(today, -7) };
}

export type { ProgressData };
