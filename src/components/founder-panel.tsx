"use client";

import { StaggerFadeIn } from "./stagger-fade-in";

const LINKS = [
  { label: "GitHub", url: "https://github.com/ruizterce", icon: "GH" },
  { label: "LinkedIn", url: "https://linkedin.com/in/ruizterce", icon: "IN" },
];

export function FounderPanel() {
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
            <strong>Nubelab</strong> is a personal project by <a href="https://github.com/ruizterce" target="_blank" rel="noreferrer" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>ruizterce</a>, a software engineer and cloud enthusiast. The goal of this project is to explore and experiment with cloud technologies, DevOps, automation, and self-hosted services in a secure and efficient manner.
          </p>
        </div>
      </StaggerFadeIn>

      <StaggerFadeIn index={1}>
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
            Find me online
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: "rgba(27, 77, 107, 0.04)",
                  border: "1px solid var(--border-light)",
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--accent)",
                  textDecoration: "none",
                  transition: "background 120ms ease",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(27, 77, 107, 0.08)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--accent)",
                    letterSpacing: "0.04em",
                    flexShrink: 0,
                  }}
                >
                  {link.icon}
                </span>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </StaggerFadeIn>
    </div>
  );
}
