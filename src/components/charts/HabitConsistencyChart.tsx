"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

type Point = { label: string; pct: number };

export function HabitConsistencyChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barCategoryGap={4}>
        <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#737373", fontSize: 10 }}
          axisLine={{ stroke: "#262626" }}
          tickLine={false}
          interval={1}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#737373", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          cursor={{ fill: "rgba(99,102,241,0.08)" }}
          contentStyle={{
            background: "#171717",
            border: "1px solid #262626",
            borderRadius: 10,
            fontSize: 12,
            color: "#e5e5e5",
          }}
          formatter={(value) => [`${Math.round(Number(value))}%`, "Habits done"]}
          labelStyle={{ color: "#a3a3a3" }}
        />
        <Bar dataKey="pct" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
