/** Given a sorted (desc) list of ISO log dates, compute the current streak
 * (consecutive days up to and including today or yesterday) and longest
 * streak on record. */
export function computeStreaks(logDatesDesc: string[]): { current: number; longest: number } {
  if (logDatesDesc.length === 0) return { current: 0, longest: 0 };

  const dates = logDatesDesc.map((d) => new Date(d + "T00:00:00").getTime()).sort((a, b) => b - a);
  const oneDay = 86400000;

  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    if (dates[i - 1] - dates[i] === oneDay) {
      run += 1;
    } else if (dates[i - 1] - dates[i] > 0) {
      longest = Math.max(longest, run);
      run = 1;
    }
  }
  longest = Math.max(longest, run);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecent = dates[0];
  const diffFromToday = (today.getTime() - mostRecent) / oneDay;

  let current = 0;
  if (diffFromToday <= 1) {
    current = 1;
    for (let i = 1; i < dates.length; i++) {
      if (dates[i - 1] - dates[i] === oneDay) current += 1;
      else break;
    }
  }

  return { current, longest };
}
