export const RECOVERY_MILESTONES = [1, 7, 30, 60, 90, 180, 365, 500, 730, 1000];

export type InsightTone = "celebrate" | "encourage" | "insight" | "gentle";

export type RecoveryInsight = { tone: InsightTone; title: string; text: string };

type Input = {
  name: string;
  currentDays: number;
  targetDays: number;
  /** streak lengths of previous attempts (from the reset history) */
  pastStreaks: number[];
  /** most-recent-first check-ins */
  checkins: { checkinDate: string; cravingLevel: number | null }[];
  checkedInToday: boolean;
};

function stageMessage(days: number, target: number): RecoveryInsight {
  if (days >= target)
    return {
      tone: "celebrate",
      title: `${target} days. You did it.`,
      text: "You set out to reach this and you reached it, one day at a time. Take a moment to honour how far you've come.",
    };
  if (days <= 3)
    return {
      tone: "encourage",
      title: "The first days are the hardest",
      text: "Only focus on today. Drink water, eat, rest, and get through the next few hours — that's all today asks of you.",
    };
  if (days <= 7)
    return {
      tone: "encourage",
      title: "You're building the first week",
      text: "Your body and mind are adjusting. Notice the moments that are easier than yesterday — they're real progress.",
    };
  if (days <= 30)
    return {
      tone: "encourage",
      title: "New patterns are forming",
      text: "Every day you choose differently makes the new way a little more automatic. Keep your routines steady.",
    };
  if (days <= 90)
    return {
      tone: "encourage",
      title: "Momentum is on your side",
      text: "This is where it starts to feel like who you are, not just what you're doing. Watch for overconfidence — keep the habits that got you here.",
    };
  if (days <= 180)
    return {
      tone: "encourage",
      title: "Real, lasting change",
      text: "Months of consistency. Think about what's grown in the space this used to take up — time, money, clarity, relationships.",
    };
  if (days <= 365)
    return {
      tone: "encourage",
      title: "On the way to a full year",
      text: "You've come through seasons, stress and ordinary days without going back. That's strength that's been tested.",
    };
  return {
    tone: "encourage",
    title: "Long-haul strength",
    text: `Over a year in. The finish line at ${target} is in view — keep living the life you've built.`,
  };
}

function avg(nums: number[]) {
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

export function recoveryInsights(input: Input): RecoveryInsight[] {
  const { currentDays, targetDays, pastStreaks, checkins, checkedInToday } = input;
  const out: RecoveryInsight[] = [];

  // 1. Milestone hit today, or close to the next one
  const nextMilestone = RECOVERY_MILESTONES.find((m) => m > currentDays && m <= targetDays) ?? (currentDays < targetDays ? targetDays : null);
  if (RECOVERY_MILESTONES.includes(currentDays) && currentDays > 1) {
    out.push({
      tone: "celebrate",
      title: `Day ${currentDays} milestone reached`,
      text: `Today marks ${currentDays} days. That's worth celebrating — tell someone who's in your corner.`,
    });
  } else if (nextMilestone && nextMilestone - currentDays <= 7) {
    const n = nextMilestone - currentDays;
    out.push({
      tone: "encourage",
      title: `${n} day${n === 1 ? "" : "s"} to day ${nextMilestone}`,
      text: "The next milestone is almost here. Protect these next few days — plan around any situations that usually test you.",
    });
  }

  // 2. Stage-aware encouragement
  out.push(stageMessage(currentDays, targetDays));

  // 3. Personal best
  const previousBest = pastStreaks.length > 0 ? Math.max(...pastStreaks) : 0;
  if (previousBest > 0) {
    if (currentDays > previousBest) {
      out.push({
        tone: "celebrate",
        title: "This is your longest streak ever",
        text: `You've passed your previous best of ${previousBest} days. You're in new territory now.`,
      });
    } else if (previousBest - currentDays <= 14) {
      const n = previousBest - currentDays + 1;
      out.push({
        tone: "insight",
        title: `${n} day${n === 1 ? "" : "s"} to a new personal best`,
        text: `Your longest streak so far is ${previousBest} days. You're close to beating it.`,
      });
    }
  }

  // 4. After a reset — focus on everything that still counts
  if (pastStreaks.length > 0 && currentDays <= 7) {
    const totalDays = pastStreaks.reduce((s, n) => s + n, 0) + currentDays;
    out.push({
      tone: "gentle",
      title: "A reset isn't the end of the story",
      text: `Across every attempt you've built ${totalDays} days of recovery. Those days changed you and they still count. What you learned from the last reset is part of your plan now.`,
    });
  }

  // 5. Craving trend (needs a few check-ins in each window)
  const withLevel = checkins.filter((c) => c.cravingLevel !== null) as { checkinDate: string; cravingLevel: number }[];
  const recent = withLevel.slice(0, 7).map((c) => c.cravingLevel);
  const before = withLevel.slice(7, 14).map((c) => c.cravingLevel);
  if (recent.length >= 3 && before.length >= 3) {
    const r = avg(recent);
    const b = avg(before);
    if (r <= b - 0.5) {
      out.push({
        tone: "insight",
        title: "Cravings are easing",
        text: `Your recent cravings average ${r.toFixed(1)}/5, down from ${b.toFixed(1)}. What you're doing is working.`,
      });
    } else if (r >= b + 0.5) {
      out.push({
        tone: "gentle",
        title: "Cravings have been higher lately",
        text: `Recent average ${r.toFixed(1)}/5, up from ${b.toFixed(1)}. That's normal and doesn't mean you're failing — it's a signal to lean on support: reach out to someone you trust, re-read your reasons, and avoid known triggers this week.`,
      });
    } else {
      out.push({
        tone: "insight",
        title: "Cravings are steady",
        text: `Averaging about ${r.toFixed(1)}/5 over your recent check-ins.`,
      });
    }
  } else if (recent.length > 0 && recent[0] >= 4) {
    out.push({
      tone: "gentle",
      title: "Today feels heavy",
      text: "Strong cravings pass. Delay, distract, and reach out to someone. You don't have to hold this alone.",
    });
  }

  // 6. Check-in nudge
  if (!checkedInToday) {
    out.push({
      tone: "insight",
      title: "No check-in yet today",
      text: "A 20-second check-in helps you spot patterns over time. It's optional — your day count keeps going either way.",
    });
  }

  return out;
}

/** The single most relevant line, for compact places like the dashboard. */
export function headlineInsight(input: Input): RecoveryInsight {
  const all = recoveryInsights(input);
  return all.find((i) => i.tone === "celebrate") ?? all.find((i) => i.tone === "gentle") ?? all[0];
}
