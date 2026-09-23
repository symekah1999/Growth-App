import { daysBetween, todayISO, toISODate } from "@/lib/utils";

export type PacingStatus = "done" | "on-track" | "behind" | "at-risk" | "overdue" | "no-deadline" | "inactive";

export type Pacing = {
  status: PacingStatus;
  label: string;
  /** progress you'd expect by today if moving linearly from start to deadline (0-100) */
  expected: number | null;
  daysLeft: number | null;
  /** progress points needed per week from here to finish on time */
  requiredPerWeek: number | null;
  message: string;
};

type GoalLike = {
  progress: number;
  status: string;
  targetDate: string | null;
  createdAt: Date | string;
};

/**
 * Compare actual progress with where a straight line from the goal's start
 * (creation date) to its deadline says you should be today.
 */
export function goalPacing(goal: GoalLike, today = todayISO()): Pacing {
  if (goal.status === "completed" || goal.progress >= 100) {
    return { status: "done", label: "Completed", expected: null, daysLeft: null, requiredPerWeek: null, message: "Done — well finished." };
  }
  if (goal.status !== "active") {
    return { status: "inactive", label: goal.status, expected: null, daysLeft: null, requiredPerWeek: null, message: `This goal is ${goal.status}.` };
  }
  if (!goal.targetDate) {
    return {
      status: "no-deadline",
      label: "No deadline",
      expected: null,
      daysLeft: null,
      requiredPerWeek: null,
      message: "Set a deadline so you can see whether you're on track.",
    };
  }

  const start = toISODate(goal.createdAt);
  const total = Math.max(1, daysBetween(start, goal.targetDate));
  const elapsed = Math.min(total, Math.max(0, daysBetween(start, today)));
  const expected = Math.round((elapsed / total) * 100);
  const daysLeft = daysBetween(today, goal.targetDate);
  const remaining = 100 - goal.progress;

  if (daysLeft < 0) {
    return {
      status: "overdue",
      label: "Overdue",
      expected: 100,
      daysLeft,
      requiredPerWeek: null,
      message: `Deadline passed ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} ago with ${remaining}% left. Finish it, or set a realistic new date.`,
    };
  }

  const weeksLeft = Math.max(daysLeft, 1) / 7;
  const requiredPerWeek = Math.round((remaining / weeksLeft) * 10) / 10;
  const gap = goal.progress - expected;

  if (gap >= -5) {
    return {
      status: "on-track",
      label: "On track",
      expected,
      daysLeft,
      requiredPerWeek,
      message:
        gap > 10
          ? `Ahead of schedule by ${gap} points — keep the pace.`
          : `Right where you should be. Keep about ${requiredPerWeek}% per week.`,
    };
  }
  if (gap >= -20) {
    return {
      status: "behind",
      label: "Slightly behind",
      expected,
      daysLeft,
      requiredPerWeek,
      message: `${Math.abs(gap)} points behind schedule. About ${requiredPerWeek}% per week gets you there on time.`,
    };
  }
  return {
    status: "at-risk",
    label: "At risk",
    expected,
    daysLeft,
    requiredPerWeek,
    message: `${Math.abs(gap)} points behind. You'd need ${requiredPerWeek}% per week — consider a push this week or moving the deadline.`,
  };
}

export function daysLeftLabel(daysLeft: number | null) {
  if (daysLeft === null) return null;
  if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
  if (daysLeft === 0) return "due today";
  if (daysLeft === 1) return "1 day left";
  return `${daysLeft} days left`;
}

/** Sort key: overdue first, then nearest deadline, then no-deadline, then inactive/done. */
export function pacingSortKey(p: Pacing) {
  if (p.status === "overdue") return -100000 + (p.daysLeft ?? 0);
  if (p.daysLeft !== null && (p.status === "on-track" || p.status === "behind" || p.status === "at-risk")) return p.daysLeft;
  if (p.status === "no-deadline") return 100000;
  return 200000;
}

export const PACING_COLOR: Record<PacingStatus, string> = {
  "on-track": "#0ca30c",
  behind: "#fab219",
  "at-risk": "#ec835a",
  overdue: "#d03b3b",
  done: "#34d399",
  "no-deadline": "#737373",
  inactive: "#525252",
};
