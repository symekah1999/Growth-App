/** Large circular meter toward a day-count target, with milestone ticks. */
export function ProgressRing({
  value,
  target,
  milestones = [],
  size = 200,
  label = "days",
}: {
  value: number;
  target: number;
  milestones?: number[];
  size?: number;
  label?: string;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2 - 6;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / target));
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${value} of ${target} ${label}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#262626" strokeWidth={stroke} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#6366f1"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {milestones
        // skip ticks that would crowd together near the start of a long target
        .filter((m) => m > 0 && m < target && m / target >= 0.05)
        .map((m) => {
          const angle = (m / target) * 2 * Math.PI - Math.PI / 2;
          const inner = r - stroke / 2 - 3;
          const outer = r + stroke / 2 + 3;
          const reached = value >= m;
          return (
            <line
              key={m}
              x1={cx + inner * Math.cos(angle)}
              y1={cy + inner * Math.sin(angle)}
              x2={cx + outer * Math.cos(angle)}
              y2={cy + outer * Math.sin(angle)}
              stroke={reached ? "#e0e7ff" : "#525252"}
              strokeWidth={2}
            >
              <title>{`Day ${m}${reached ? " — reached" : ""}`}</title>
            </line>
          );
        })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#fafafa" fontSize={size * 0.2} fontWeight={600}>
        {value}
      </text>
      <text x={cx} y={cy + size * 0.11} textAnchor="middle" fill="#a3a3a3" fontSize={size * 0.065}>
        of {target} {label}
      </text>
    </svg>
  );
}
