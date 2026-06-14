"use client";

import { StaggerFadeIn } from "./stagger-fade-in";

interface Service {
  name: string;
  desc: string;
  url?: string;
  status: "running" | "healthy";
  internal?: boolean;
  private?: boolean;
  membersOnly?: boolean;
}

const GROUPS: { name: string; services: Service[] }[] = [
  {
    name: "Services",
    services: [
      { name: "n8n", desc: "Workflow Automation", url: "https://n8n.nubelab.es", status: "running", membersOnly: true },
      { name: "Navidrome", desc: "Music Streaming", url: "https://music.nubelab.es", status: "running", membersOnly: true },
      { name: "Hermes", desc: "AI Agent & Web UI", status: "running" , private: true},
      { name: "Homepage", desc: "Personal Dashboard", status: "running", private: true},
    ],
  },
    {
    name: "Infrastructure",
    services: [
      { name: "Caddy", desc: "Reverse Proxy", status: "healthy" },
    ],
  },
  {
    name: "Databases",
    services: [
      { name: "", desc: "", status: "healthy", internal: true },
      { name: "", desc: "", status: "healthy", internal: true },
    ],
  },
  {
    name: "Monitoring",
    services: [
      { name: "Internal API", desc: "Sanitized Monitoring Metrics", status: "running"},
      { name: "", desc: "", status: "running", internal: true },
      { name: "", desc: "", status: "running", internal: true },
      { name: "", desc: "", status: "running", internal: true },
      { name: "", desc: "", status: "running", internal: true },
    ],
  },
];

function StatusDot({ status }: { status: "running" | "healthy" }) {
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "var(--accent-data)",
        flexShrink: 0,
        boxShadow: "0 0 4px rgba(26, 107, 82, 0.4)",
      }}
    />
  );
}

export function CorePanel() {
  return (
    <div style={{ padding: "0 0 32px" }}>
      <StaggerFadeIn index={0}>
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
            About
          </span>
          <p
            style={{
              fontFamily: "var(--font-mono-stack)",
              fontSize: 13,
              lineHeight: 1.8,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            Multi-tenant cloud platform running on a Hetzner CPX22 VPS.
            Containerized apps orchestrated with Docker, connected via
            internal networks, and exposed through a central Caddy reverse proxy.
          </p>
        </div>
      </StaggerFadeIn>

        {GROUPS.map((group, gi) => (
          <StaggerFadeIn key={group.name} index={gi + 1}>
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
            {group.name}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {group.services.map((svc, i) => (
              <div
                key={svc.name || `redacted-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: "rgba(27, 77, 107, 0.04)",
                  border: "1px solid var(--border-light)",
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: 13,
                }}
              >
                <StatusDot status={svc.status} />
                <div style={{ flex: 1 }}>
                  {svc.internal ? (
                    <span style={{ fontWeight: 600, color: "rgba(184, 92, 40, 0.6)" }}>[REDACTED]</span>
                  ) : svc.url ? (
                    <a
                      href={svc.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}
                    >
                      {svc.name}
                    </a>
                  ) : (
                    <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{svc.name}</span>
                  )}
                  {!svc.internal && svc.desc && (
                    <span style={{ color: "var(--muted)", marginLeft: 8, fontSize: 12 }}>
                      {svc.desc}
                    </span>
                  )}
                  {svc.private && (
                    <span style={{ color: "rgba(184, 92, 40, 0.5)", marginLeft: 8, fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      PRIVATE
                    </span>
                  )}
                  {svc.membersOnly && (
                    <span style={{ color: "var(--accent)", marginLeft: 8, fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      MEMBERS ONLY
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: "var(--accent-data)",
                    textTransform: "uppercase",
                  }}
                >
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        </StaggerFadeIn>
      ))}
    </div>
  );
}
