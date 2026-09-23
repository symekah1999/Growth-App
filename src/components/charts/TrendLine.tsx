"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendPoint = { label: string; value: number | null; note?: string };
export type TrendFormat = "number" | "percent" | "currency" | "mood" | "craving";

const MOOD_LABELS: Record<number, string> = { 2: "great", 1: "good", 0: "neutral", [-1]: "uneasy", [-2]: "low" };
const CRAVING_LABELS: Record<number, string> = { 1: "none", 2: "mild", 3: "moderate", 4: "strong", 5: "intense" };

function fmt(v: number, format: TrendFormat, currencyCode: string) {
  if (format === "percent") return `${Math.round(v)}%`;
  if (format === "currency")
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: currencyCode, maximumFractionDigits: 0 }).format(v);
  if (format === "mood") return MOOD_LABELS[Math.round(v)] ?? v.toFixed(1);
  if (format === "craving") return `${v.toFixed(1)} · ${CRAVING_LABELS[Math.round(v)] ?? ""}`;
  return v.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function compactTick(v: number, format: TrendFormat) {
  if (format === "mood") return MOOD_LABELS[v] ?? "";
  if (format === "craving") return String(v);
  if (format === "percent") return `${v}%`;
  if (format === "currency") {
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (Math.abs(v) >= 1000) return `${Math.round(v / 1000)}k`;
    return String(v);
  }
  return String(v);
}

export function TrendLine({
  data,
  format = "number",
  currencyCode = "KES",
  domain,
  ticks,
  referenceY,
  referenceLabel,
  seriesName,
  height = 180,
  color = "#6366f1",
}: {
  data: TrendPoint[];
  format?: TrendFormat;
  currencyCode?: string;
  domain?: [number, number];
  ticks?: number[];
  referenceY?: number;
  referenceLabel?: string;
  seriesName: string;
  height?: number;
  color?: string;
}) {
  const gradientId = `tl-${seriesName.replace(/\W/g, "")}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#737373", fontSize: 10 }}
          axisLine={{ stroke: "#333" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          domain={domain ?? ["auto", "auto"]}
          ticks={ticks}
          tick={{ fill: "#737373", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={format === "mood" ? 52 : 44}
          tickFormatter={(v: number) => compactTick(v, format)}
        />
        {referenceY !== undefined && (
          <ReferenceLine
            y={referenceY}
            stroke="#a3a3a3"
            strokeDasharray="4 4"
            label={referenceLabel ? { value: referenceLabel, fill: "#a3a3a3", fontSize: 10, position: "insideTopRight" } : undefined}
          />
        )}
        <Tooltip
          cursor={{ stroke: "#525252", strokeWidth: 1 }}
          contentStyle={{ background: "#171717", border: "1px solid #333", borderRadius: 10, fontSize: 12, color: "#e5e5e5" }}
          labelStyle={{ color: "#a3a3a3" }}
          formatter={(value) => [fmt(Number(value), format, currencyCode), seriesName]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          connectNulls
          dot={false}
          activeDot={{ r: 4, stroke: "#171717", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
