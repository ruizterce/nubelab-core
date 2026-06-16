"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonitorChartProps {
  title: string;
  data: { time: string; value: number }[];
  unit?: string;
  max?: number;
  color?: string;
}

export function MonitorChart({
  title,
  data,
  unit = "%",
  max = 100,
  color = "#1b4d6b",
}: MonitorChartProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono-stack)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "var(--muted)",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
        {data.length > 0 && (
          <span
            style={{
              fontFamily: "var(--font-mono-stack)",
              fontSize: 18,
              fontWeight: 700,
              color,
            }}
          >
            {data[data.length - 1].value.toFixed(1)}
            {unit}
          </span>
        )}
      </div>
      <div style={{ width: "100%", height: 140 }}>
        {data.length > 1 ? (
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-light)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fontFamily: "var(--font-mono-stack)", fill: "#131a20" }}
                stroke="#131a20"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                domain={[0, max]}
                tick={{ fontSize: 10, fontFamily: "var(--font-mono-stack)", fill: "#131a20" }}
                stroke="#131a20"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: 12,
                  border: "1px solid var(--border)",
                  background: "var(--surface-raised)",
                }}
                formatter={(value) => [`${Number(value).toFixed(1)}${unit}`, title]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-sans-stack)",
              fontSize: 12,
              color: "var(--muted)",
            }}
          >
            Collecting data...
          </div>
        )}
      </div>
    </div>
  );
}
