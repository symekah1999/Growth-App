import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { debtPayments, debts, journalEntries, recoveryCheckins, recoveryResets, recoveryTrackers, savingsContributions, savingsPlans } from "@/db/schema";
import { gratitudeEntries } from "@/db/schema-gratitude";
import { lifeLessons } from "@/db/schema-lessons";
import { challengeDays, challengePillars, challengeProverbs, challengeReviews, challengeRituals, challengeSetbacks, challengeWild } from "@/db/schema-challenge";
import { DAILY_CHECKS } from "@/db/seed-data/challenge";
import { PILLARS } from "@/db/seed-data/pillars";
import { ANIMALS } from "@/db/seed-data/wild";
import { myAffirmations, todontLogs, todonts, yearPlans, yearReviews } from "@/db/schema-life";

export const SECTIONS = [
  { key: "journal", label: "Journal", href: "/journal", color: "bg-sky-500/20 text-sky-200" },
  { key: "gratitude", label: "Gratitude", href: "/gratitude", color: "bg-amber-500/20 text-amber-200" },
  { key: "lessons", label: "Lessons", href: "/lessons", color: "bg-violet-500/20 text-violet-200" },
  { key: "ritual", label: "Rituals", href: "/challenge/ritual", color: "bg-indigo-500/20 text-indigo-200" },
  { key: "daily", label: "Daily log", href: "/challenge?tab=today", color: "bg-emerald-500/20 text-emerald-200" },
  { key: "proverbs", label: "Proverbs", href: "/challenge?tab=proverbs", color: "bg-yellow-500/20 text-yellow-200" },
  { key: "apex", label: "Apex", href: "/challenge?tab=wild", color: "bg-lime-500/20 text-lime-200" },
  { key: "review", label: "Reviews", href: "/challenge?tab=review", color: "bg-rose-500/20 text-rose-200" },
  { key: "recovery", label: "Recovery", href: "/recovery", color: "bg-teal-500/20 text-teal-200" },
  { key: "money", label: "Money", href: "/savings", color: "bg-orange-500/20 text-orange-200" },
  { key: "todont", label: "To-don't", href: "/todont", color: "bg-red-500/20 text-red-200" },
  { key: "year", label: "My year", href: "/year", color: "bg-fuchsia-500/20 text-fuchsia-200" },
  { key: "affirm", label: "Affirmations", href: "/affirmations", color: "bg-yellow-500/20 text-yellow-100" },
] as const;
export type SectionKey = (typeof SECTIONS)[number]["key"];

type Line = { l?: string; t: string };
export type Entry = {
  id: string;
  day: string; // YYYY-MM-DD in Nairobi terms
  at: number; // ms, used to order entries within a day
  section: SectionKey;
  title: string;
  lines: Line[];
  href: string;
};

const ms = (d: Date | string | null | undefined, fallback = 0) => (d ? new Date(d).getTime() : fallback);
const dayMs = (day: string) => Date.parse(day + "T12:00:00Z");
const ok = (s: string | null | undefined): s is string => !!s && s.trim() !== "";
const pairs = (list: [string, string | null | undefined][]): Line[] => list.filter(([, t]) => ok(t)).map(([l, t]) => ({ l, t: t as string }));
const safe = async <T,>(p: Promise<T[]>): Promise<T[]> => p.catch(() => []);

/** Everything the owner has written or logged since `since` (YYYY-MM-DD), across all sections. Each source fails soft. */
export async function loadEntries(userId: string, since: string): Promise<Entry[]> {
  const out: Entry[] = [];

  const [journal, gratitude, lessons, days, pillars, rituals, proverbs, wild, reviews, setbacks, checkins, resets, savings, payments] = await Promise.all([
    safe(db.select().from(journalEntries).where(and(eq(journalEntries.userId, userId), gte(journalEntries.entryDate, since))).orderBy(desc(journalEntries.entryDate)).limit(400)),
    safe(db.select().from(gratitudeEntries).where(and(eq(gratitudeEntries.userId, userId), gte(gratitudeEntries.entryDate, since))).orderBy(desc(gratitudeEntries.entryDate)).limit(600)),
    safe(db.select().from(lifeLessons).where(and(eq(lifeLessons.userId, userId), gte(lifeLessons.learnedOn, since))).orderBy(desc(lifeLessons.learnedOn)).limit(300)),
    safe(db.select().from(challengeDays).where(and(eq(challengeDays.userId, userId), gte(challengeDays.day, since))).orderBy(desc(challengeDays.day)).limit(400)),
    safe(db.select({ day: challengePillars.day, pillar: challengePillars.pillar }).from(challengePillars).where(and(eq(challengePillars.userId, userId), gte(challengePillars.day, since))).limit(4000)),
    safe(db.select().from(challengeRituals).where(and(eq(challengeRituals.userId, userId), gte(challengeRituals.day, since))).orderBy(desc(challengeRituals.day)).limit(800)),
    safe(db.select().from(challengeProverbs).where(and(eq(challengeProverbs.userId, userId), gte(challengeProverbs.day, since))).orderBy(desc(challengeProverbs.day)).limit(400)),
    safe(db.select().from(challengeWild).where(and(eq(challengeWild.userId, userId), gte(challengeWild.day, since))).orderBy(desc(challengeWild.day)).limit(400)),
    safe(db.select().from(challengeReviews).where(and(eq(challengeReviews.userId, userId), gte(challengeReviews.weekEnding, since))).orderBy(desc(challengeReviews.weekEnding)).limit(100)),
    safe(db.select().from(challengeSetbacks).where(and(eq(challengeSetbacks.userId, userId), gte(challengeSetbacks.day, since))).orderBy(desc(challengeSetbacks.day)).limit(200)),
    safe(
      db
        .select({ day: recoveryCheckins.checkinDate, craving: recoveryCheckins.cravingLevel, note: recoveryCheckins.note, name: recoveryTrackers.name, at: recoveryCheckins.updatedAt })
        .from(recoveryCheckins)
        .innerJoin(recoveryTrackers, eq(recoveryCheckins.trackerId, recoveryTrackers.id))
        .where(and(eq(recoveryTrackers.userId, userId), gte(recoveryCheckins.checkinDate, since)))
        .limit(400),
    ),
    safe(
      db
        .select({ id: recoveryResets.id, day: recoveryResets.resetDate, streak: recoveryResets.streakDaysAtReset, note: recoveryResets.note, name: recoveryTrackers.name, at: recoveryResets.createdAt })
        .from(recoveryResets)
        .innerJoin(recoveryTrackers, eq(recoveryResets.trackerId, recoveryTrackers.id))
        .where(and(eq(recoveryTrackers.userId, userId), gte(recoveryResets.resetDate, since)))
        .limit(200),
    ),
    safe(
      db
        .select({ id: savingsContributions.id, day: savingsContributions.contributedOn, amount: savingsContributions.amount, note: savingsContributions.note, name: savingsPlans.name, currency: savingsPlans.currency, at: savingsContributions.createdAt })
        .from(savingsContributions)
        .innerJoin(savingsPlans, eq(savingsContributions.planId, savingsPlans.id))
        .where(and(eq(savingsPlans.userId, userId), gte(savingsContributions.contributedOn, since)))
        .limit(400),
    ),
    safe(
      db
        .select({ id: debtPayments.id, day: debtPayments.paidOn, amount: debtPayments.amount, note: debtPayments.note, name: debts.name, currency: debts.currency, at: debtPayments.createdAt })
        .from(debtPayments)
        .innerJoin(debts, eq(debtPayments.debtId, debts.id))
        .where(and(eq(debts.userId, userId), gte(debtPayments.paidOn, since)))
        .limit(400),
    ),
  ]);

  const [tdLogs, tdItems, yReviews, yPlans, affirms] = await Promise.all([
    safe(db.select().from(todontLogs).where(and(eq(todontLogs.userId, userId), gte(todontLogs.day, since))).limit(3000)),
    safe(db.select({ id: todonts.id, text: todonts.text }).from(todonts).where(eq(todonts.userId, userId))),
    safe(db.select().from(yearReviews).where(eq(yearReviews.userId, userId))),
    safe(db.select({ age: yearPlans.age, startDate: yearPlans.startDate }).from(yearPlans).where(eq(yearPlans.userId, userId))),
    safe(db.select().from(myAffirmations).where(eq(myAffirmations.userId, userId)).orderBy(desc(myAffirmations.createdAt)).limit(200)),
  ]);
  const tdName = (id: string) => tdItems.find((t) => t.id === id)?.text ?? "Removed item";
  for (const [day, list] of groupLogs(tdLogs)) {
    if (day < since) continue;
    const held = list.filter((l) => l.held).length;
    const slipped = list.filter((l) => !l.held);
    out.push({
      id: `td-${day}`, day, at: Math.max(...list.map((l) => ms(l.updatedAt, dayMs(day)))), section: "todont", title: `To-don't: held ${held}, slipped ${slipped.length}`,
      lines: slipped.length ? slipped.map((l) => ({ l: "Slipped", t: l.note ? `${tdName(l.todontId)} (${l.note})` : tdName(l.todontId) })) : [{ t: "Held the line on everything logged." }],
      href: "/todont",
    });
  }
  for (const r of yReviews) {
    const at = ms(r.updatedAt, Date.now());
    const day = new Date(at).toISOString().slice(0, 10);
    if (day < since) continue;
    out.push({ id: `yr-${r.age}-${r.kind}-${r.period}`, day, at, section: "year", title: `Year ${r.age}: ${r.kind === "quarter" ? `Q${r.period} review` : `month ${r.period} check-in`}${r.rating ? ` (${r.rating}/10)` : ""}`, lines: pairs([["Wins", r.wins], ["Lessons", r.lessons], ["Adjust", r.adjust]]), href: `/year?age=${r.age}&tab=${r.kind === "quarter" ? "quarters" : "checkins"}` });
  }
  for (const p of yPlans)
    if (p.startDate >= since) out.push({ id: `yp-${p.age}`, day: p.startDate, at: dayMs(p.startDate), section: "year", title: `Year ${p.age} began`, lines: [{ t: "Birthday. A new year of life started." }], href: `/year?age=${p.age}` });
  for (const a of affirms) {
    const day = new Date(a.createdAt).toISOString().slice(0, 10);
    if (day < since) continue;
    out.push({ id: `af-${a.id}`, day, at: ms(a.createdAt), section: "affirm", title: a.libraryKey ? "Affirmation saved" : "Affirmation written", lines: [{ t: a.text }], href: "/affirmations" });
  }

  for (const j of journal)
    out.push({ id: `j-${j.id}`, day: j.entryDate, at: ms(j.createdAt, dayMs(j.entryDate)), section: "journal", title: j.title || "Journal entry", lines: [{ t: j.body }, ...pairs([["Mood", j.mood], ["Tags", j.tags?.length ? j.tags.join(", ") : ""]])], href: "/journal" });

  for (const g of gratitude)
    out.push({ id: `g-${g.id}`, day: g.entryDate, at: ms(g.createdAt, dayMs(g.entryDate)), section: "gratitude", title: "Grateful for", lines: [{ t: g.text }, ...(g.category && g.category !== "general" ? [{ l: "About", t: g.category }] : [])], href: "/gratitude" });

  for (const l of lessons)
    out.push({ id: `l-${l.id}`, day: l.learnedOn, at: ms(l.createdAt, dayMs(l.learnedOn)), section: "lessons", title: "Lesson learned", lines: [{ t: l.lesson }, ...pairs([["Context", l.context], ["Source", l.source]])], href: "/lessons" });

  const pillarsByDay = new Map<string, number[]>();
  for (const p of pillars) pillarsByDay.set(p.day, [...(pillarsByDay.get(p.day) ?? []), p.pillar]);

  for (const d of days) {
    const checks = (d.checks ?? {}) as Record<string, boolean>;
    const done = DAILY_CHECKS.filter((c) => checks[c.key]).map((c) => c.label);
    const nums = [d.deepBlocks != null ? `${d.deepBlocks} deep block${d.deepBlocks === 1 ? "" : "s"}` : "", d.socialMinutes != null ? `${d.socialMinutes} min social` : "", d.sleepHours ? `${d.sleepHours} h sleep` : ""].filter(Boolean).join(" · ");
    const pil = (pillarsByDay.get(d.day) ?? []).sort((a, b) => a - b);
    out.push({
      id: `d-${d.day}`, day: d.day, at: ms(d.updatedAt, dayMs(d.day)), section: "daily", title: `Daily score ${d.score}/7`,
      lines: [
        ...pairs([["Done", done.join(", ")], ["Numbers", nums], ["Tomorrow", d.tomorrowTask], ["Note", d.note]]),
        ...(pil.length ? [{ l: "Pillars", t: `${pil.length}/10: ${pil.map((n) => PILLARS[n - 1]?.title ?? n).join(", ")}` }] : []),
      ],
      href: `/challenge?tab=today&d=${d.day}`,
    });
  }
  // pillar-only days (no daily score row)
  const dayKeys = new Set(days.map((d) => d.day));
  for (const [day, list] of pillarsByDay)
    if (!dayKeys.has(day)) out.push({ id: `p-${day}`, day, at: dayMs(day), section: "daily", title: "Ten pillars", lines: [{ t: `${list.length}/10: ${list.sort((a, b) => a - b).map((n) => PILLARS[n - 1]?.title ?? n).join(", ")}` }], href: "/challenge?tab=pillars" });

  for (const r of rituals) {
    const a = (r.answers ?? {}) as Record<string, string>;
    const lines =
      r.kind === "morning"
        ? pairs([["Prayer", a.prayer], ["Verse reflection", a.reflection], ["Could go wrong", a.risk], ["Response", a.response], ["Decisive task", a.task1], ["Also", [a.task2, a.task3].filter(Boolean).join("; ")]])
        : pairs([["Planned", a.aarPlan], ["Happened", a.aarReality], ["Fix", a.aarFix], ["Did well", a.stoicWell], ["Did badly", a.stoicBad], ["Left undone", a.stoicLeft], ["Grateful", [a.g1, a.g2, a.g3].filter(Boolean).join("; ")]]);
    out.push({ id: `r-${r.day}-${r.kind}`, day: r.day, at: ms(r.completedAt, dayMs(r.day)), section: "ritual", title: r.kind === "morning" ? "Morning ritual" : "Evening ritual", lines: lines.length ? lines : [{ t: "Completed." }], href: `/challenge/ritual?mode=${r.kind}` });
  }

  for (const p of proverbs)
    out.push({ id: `pv-${p.day}`, day: p.day, at: ms(p.updatedAt, dayMs(p.day)), section: "proverbs", title: `Proverbs ${p.chapter}`, lines: p.reflection ? [{ l: "Applying it", t: p.reflection }] : [{ t: "Read." }], href: "/challenge?tab=proverbs" });

  for (const w of wild)
    out.push({ id: `w-${w.day}`, day: w.day, at: ms(w.updatedAt, dayMs(w.day)), section: "apex", title: ANIMALS.find((a) => a.key === w.animal)?.name ?? "Apex animal", lines: w.reflection ? [{ l: "Applying it", t: w.reflection }] : [{ t: "Studied." }], href: "/challenge?tab=wild" });

  for (const r of reviews)
    out.push({ id: `rv-${r.id}`, day: r.weekEnding, at: ms(r.createdAt, dayMs(r.weekEnding)), section: "review", title: `Weekly review (${r.pace})`, lines: pairs([["Worked", r.worked], ["Failed", r.failed], ["Change", r.change], ["Next week", r.nextPlan]]), href: "/challenge?tab=review" });

  for (const s of setbacks)
    out.push({ id: `s-${s.id}`, day: s.day, at: ms(s.createdAt, dayMs(s.day)), section: "review", title: "Setback logged", lines: pairs([["What happened", s.what], ["In my control", s.control], ["Next time", s.nextTime]]), href: "/challenge?tab=review" });

  for (const c of checkins)
    out.push({ id: `rc-${c.name}-${c.day}`, day: c.day, at: ms(c.at, dayMs(c.day)), section: "recovery", title: `${c.name} check-in`, lines: pairs([["Craving", c.craving ? `${c.craving}/5` : ""], ["Note", c.note]]).concat(c.craving || c.note ? [] : [{ t: "Checked in." }]), href: "/recovery" });

  for (const r of resets)
    out.push({ id: `rr-${r.id}`, day: r.day, at: ms(r.at, dayMs(r.day)), section: "recovery", title: `${r.name} reset`, lines: [{ l: "Streak was", t: `${r.streak} days` }, ...pairs([["Note", r.note]])], href: "/recovery" });

  for (const s of savings)
    out.push({ id: `sv-${s.id}`, day: s.day, at: ms(s.at, dayMs(s.day)), section: "money", title: `Saved to ${s.name}`, lines: [{ t: `${s.currency} ${Number(s.amount).toLocaleString("en-US")}` }, ...pairs([["Note", s.note]])], href: "/savings" });

  for (const p of payments)
    out.push({ id: `dp-${p.id}`, day: p.day, at: ms(p.at, dayMs(p.day)), section: "money", title: `Paid toward ${p.name}`, lines: [{ t: `${p.currency} ${Number(p.amount).toLocaleString("en-US")}` }, ...pairs([["Note", p.note]])], href: "/debts" });

  return out.sort((a, b) => (a.day === b.day ? b.at - a.at : a.day < b.day ? 1 : -1));
}

function groupLogs<T extends { day: string }>(rows: T[]) {
  const m = new Map<string, T[]>();
  for (const r of rows) m.set(r.day, [...(m.get(r.day) ?? []), r]);
  return m;
}
