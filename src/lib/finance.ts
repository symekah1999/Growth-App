export type DebtInput = {
  id: string;
  name: string;
  balance: number;
  interestRateApr: number; // e.g. 24 for 24% APR
  minPayment: number;
};

export type PayoffPlanStep = {
  id: string;
  name: string;
  monthsToPayoff: number;
  totalInterestPaid: number;
};

/**
 * Simulates snowball (smallest balance first) or avalanche (highest
 * interest first) payoff order given a fixed extra monthly budget on top of
 * everyone's minimum payments. Simple monthly-compounding simulation, good
 * enough for planning purposes (not for exact bank statements).
 */
export function simulatePayoff(
  debts: DebtInput[],
  extraMonthlyBudget: number,
  strategy: "snowball" | "avalanche",
): { order: PayoffPlanStep[]; totalMonths: number; totalInterest: number; balanceByMonth: number[] } {
  const working = debts
    .filter((d) => d.balance > 0)
    .map((d) => ({ ...d, remaining: d.balance, interestPaid: 0, paidOffMonth: null as number | null }));

  const order = [...working].sort((a, b) =>
    strategy === "snowball" ? a.balance - b.balance : b.interestRateApr - a.interestRateApr,
  );

  let month = 0;
  let extraPool = extraMonthlyBudget;
  const balanceByMonth: number[] = [working.reduce((s, d) => s + d.remaining, 0)];
  const maxMonths = 600; // 50 years safety cap

  while (working.some((d) => d.remaining > 0.01) && month < maxMonths) {
    month += 1;

    // accrue interest
    for (const d of working) {
      if (d.remaining <= 0) continue;
      const monthlyRate = d.interestRateApr / 100 / 12;
      const interest = d.remaining * monthlyRate;
      d.interestPaid += interest;
      d.remaining += interest;
    }

    // pay minimums
    for (const d of working) {
      if (d.remaining <= 0) continue;
      const pay = Math.min(d.minPayment, d.remaining);
      d.remaining -= pay;
    }

    // apply extra budget down the priority order (snowball/avalanche)
    let pool = extraPool;
    for (const target of order) {
      const d = working.find((w) => w.id === target.id)!;
      if (d.remaining <= 0 || pool <= 0) continue;
      const pay = Math.min(pool, d.remaining);
      d.remaining -= pay;
      pool -= pay;
    }

    // once a debt is paid off, its minimum payment rolls into the extra pool
    // (classic snowball/avalanche "rolling" behavior)
    for (const d of working) {
      if (d.remaining <= 0.01 && d.paidOffMonth === null) {
        d.paidOffMonth = month;
        extraPool += d.minPayment;
      }
    }

    balanceByMonth.push(Math.max(0, working.reduce((s, d) => s + Math.max(0, d.remaining), 0)));
  }

  const stepOrder: PayoffPlanStep[] = order.map((o) => {
    const d = working.find((w) => w.id === o.id)!;
    return {
      id: d.id,
      name: d.name,
      monthsToPayoff: d.paidOffMonth ?? month,
      totalInterestPaid: Math.round(d.interestPaid * 100) / 100,
    };
  });

  return {
    order: stepOrder,
    totalMonths: month,
    totalInterest: Math.round(working.reduce((s, d) => s + d.interestPaid, 0) * 100) / 100,
    balanceByMonth,
  };
}

/** Months needed to reach a savings target given a flat monthly contribution. */
export function monthsToTarget(currentTotal: number, target: number, monthlyContribution: number) {
  if (monthlyContribution <= 0) return Infinity;
  const remaining = target - currentTotal;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / monthlyContribution);
}
