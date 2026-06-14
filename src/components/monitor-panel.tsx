"use client";

import { useMonitorData, fmtTime } from "@/hooks/use-monitor-data";
import { MonitorChart } from "./monitor-chart";

export function MonitorPanel({ visible }: { visible: boolean }) {
  const data = useMonitorData(visible);

  const cpuData =
    data.history?.data.cpu.map((e) => ({
      time: fmtTime(e.timestamp),
      value: e.value,
    })) ?? [];

  const memData =
    data.history?.data.memory.map((e) => ({
      time: fmtTime(e.timestamp),
      value: e.value,
    })) ?? [];

  return (
    <div style={{ padding: "0 0 32px" }}>
      {data.error && (
        <div
          style={{
            padding: "8px 12px",
            marginBottom: 16,
            fontFamily: "var(--font-mono-stack)",
            fontSize: 12,
            color: "var(--accent-warn)",
            background: "rgba(184, 92, 40, 0.08)",
            border: "1px solid rgba(184, 92, 40, 0.2)",
          }}
        >
          {data.error}
        </div>
      )}

      <MonitorChart
        title="CPU"
        data={cpuData}
        color="#2563eb"
      />

      <MonitorChart
        title="Memory"
        data={memData}
        color="#16a34a"
      />

      {data.health && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 32 }}>
            <div>
              <span
                style={{
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Containers
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--accent-data)",
                }}
              >
                {data.health.data.containers.running}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: 12,
                  color: "var(--muted)",
                  marginLeft: 4,
                }}
              >
                running
              </span>
            </div>
            {data.uptime && (
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-mono-stack)",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Uptime
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono-stack)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--foreground)",
                  }}
                >
                  {data.uptime.data.uptimeHuman}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {data.storage && data.storage.data.volumes.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <span
            style={{
              fontFamily: "var(--font-mono-stack)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: "var(--muted)",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 8,
            }}
          >
            Storage
          </span>
          {data.storage.data.volumes.map((vol) => {
            const totalGB = vol.totalBytes / (1024 ** 3);
            const usedGB = vol.usedBytes / (1024 ** 3);
            return (
            <div key={vol.label} style={{ marginBottom: 8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <span>{vol.label}</span>
                <span style={{ color: "var(--muted)" }}>
                  {usedGB.toFixed(1)} / {totalGB.toFixed(1)} GB
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: "var(--border-light)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${vol.utilizationPercent}%`,
                    background:
                      vol.utilizationPercent > 90
                        ? "var(--accent-warn)"
                        : "var(--accent-data)",
                    borderRadius: 2,
                    transition: "width 300ms ease",
                  }}
                />
              </div>
            </div>
            );
          })}
        </div>
      )}

      {data.healthcheck && (
        <div>
          <span
            style={{
              fontFamily: "var(--font-mono-stack)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: "var(--muted)",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 8,
            }}
          >
            Providers
          </span>
          {data.healthcheck.data.providers.map((p) => (
            <div
              key={p.providerId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--font-mono-stack)",
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background:
                    p.status === "up" ? "var(--accent-data)" : "var(--accent-warn)",
                  flexShrink: 0,
                }}
              />
              <span>{p.providerId}</span>
              <span style={{ color: "var(--muted)" }}>{p.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
