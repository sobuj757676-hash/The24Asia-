"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

const COLORS = ["#a7f3d0", "#6ee7b7", "#34d399", "#059669"];

/**
 * Learning funnel visualisation. Rendered client-side and lazily imported by
 * the dashboard so recharts stays out of the initial bundle.
 * An accessible table equivalent is provided by the caller (PRD 15).
 */
export function FunnelChart({
  data,
}: {
  data: { stage: string; value: number }[];
}) {
  return (
    <div className="h-56 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.12} />
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 11 }}
            stroke="currentColor"
            opacity={0.6}
            interval={0}
          />
          <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.6} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,.08)",
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
