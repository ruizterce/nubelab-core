"use client";

import { useMonitorData, fmtTime } from "@/hooks/use-monitor-data";
import { MonitorChart } from "./monitor-chart";
import { StaggerFadeIn } from "./stagger-fade-in";
import { sectionLabel } from "./panel-styles";

const statLabel = { ...sectionLabel, marginBottom: 6 };
const statValue = { fontFamily: "var(--font-heading-stack)", fontSize: 18, fontWeight: 700 as const };

export function MonitorPanel({ visible }: { visible: boolean }) {
  const data = useMonitorData(visible);

  const cpuData =
    data.history?.data.cpu.map((e) => ({ time: fmtTime(e.timestamp), value: e.value })) ?? [];
  const memData =
    data.history?.data.memory.map((e) => ({ time: fmtTime(e.timestamp), value: e.value })) ?? [];

  return (
    <div style={{ padding: "0 0 32px" }}>
      {data.error && (
        <div style={{ padding: "8px 12px", marginBottom: 16, fontFamily: "var(--font-sans-stack)", fontSize: 12, color: "var(--accent-warn)", background: "rgba(184, 92, 40, 0.08)", border: "1px solid rgba(184, 92, 40, 0.2)" }}>
          {data.error}
        </div>
      )}

      <StaggerFadeIn index={0}>
        <MonitorChart title="CPU" data={cpuData} color="#2563eb" />
      </StaggerFadeIn>

      <StaggerFadeIn index={1}>
        <MonitorChart title="Memory" data={memData} color="#16a34a" />
      </StaggerFadeIn>

      {data.health && (
        <StaggerFadeIn index={2}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 32 }}>
              <div>
                <span style={statLabel}>Containers</span>
                <span style={{ ...statValue, color: "var(--accent-data)" }}>{data.health.data.containers.running}</span>
                <span style={{ fontFamily: "var(--font-sans-stack)", fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>running</span>
              </div>
              {data.uptime && (
                <div>
                  <span style={statLabel}>Uptime</span>
                  <span style={{ ...statValue, color: "var(--foreground)" }}>{data.uptime.data.uptimeHuman}</span>
                </div>
              )}
            </div>
          </div>
        </StaggerFadeIn>
      )}

      {data.storage && data.storage.data.volumes.length > 0 && (
        <StaggerFadeIn index={3}>
          <div style={{ marginBottom: 24 }}>
            <span style={sectionLabel}>Storage</span>
            {data.storage.data.volumes.map((vol) => {
              const totalGB = vol.totalBytes / (1024 ** 3);
              const usedGB = vol.usedBytes / (1024 ** 3);
              return (
                <div key={vol.label} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-sans-stack)", fontSize: 12, marginBottom: 4 }}>
                    <span>{vol.label}</span>
                    <span style={{ color: "var(--muted)" }}>{usedGB.toFixed(1)} / {totalGB.toFixed(1)} GB</span>
                  </div>
                  <div style={{ height: 4, background: "var(--border-light)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${vol.utilizationPercent}%`, background: vol.utilizationPercent > 90 ? "var(--accent-warn)" : "var(--accent-data)", borderRadius: 2, transition: "width 300ms ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </StaggerFadeIn>
      )}

      {data.healthcheck && (
        <StaggerFadeIn index={4}>
          <div>
            <span style={sectionLabel}>Providers</span>
            {data.healthcheck.data.providers.map((p) => (
              <div key={p.providerId} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-sans-stack)", fontSize: 12, marginBottom: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.status === "up" ? "var(--accent-data)" : "var(--accent-warn)", flexShrink: 0 }} />
                <span>{p.providerId}</span>
                <span style={{ color: "var(--muted)" }}>{p.status}</span>
              </div>
            ))}
          </div>
        </StaggerFadeIn>
      )}
    </div>
  );
}
