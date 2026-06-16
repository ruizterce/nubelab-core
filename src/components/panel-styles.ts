import { type CSSProperties } from "react";

export const sectionLabel: CSSProperties = {
  fontFamily: "var(--font-mono-stack)",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.06em",
  color: "var(--muted)",
  textTransform: "uppercase",
  display: "block",
  marginBottom: 8,
};

export const card: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 12px",
  background: "rgba(27, 77, 107, 0.04)",
  border: "1px solid var(--border-light)",
  fontFamily: "var(--font-sans-stack)",
  fontSize: 13,
};

export const cardMono: CSSProperties = {
  ...card,
  fontFamily: "var(--font-mono-stack)",
};

export const iconBox: CSSProperties = {
  width: 28,
  height: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(27, 77, 107, 0.08)",
  flexShrink: 0,
};

export const statusDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "var(--accent-data)",
  flexShrink: 0,
  boxShadow: "0 0 4px rgba(26, 107, 82, 0.4)",
};
