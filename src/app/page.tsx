"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { NavSidebar } from "@/components/nav-sidebar";
import { SectionPanel } from "@/components/section-panel";
import { StatusBar } from "@/components/status-bar";

const MoonScene = dynamic(
  () => import("@/components/moon-scene").then((m) => ({ default: m.MoonScene })),
  { ssr: false }
);

const BUILDINGS = ["Core_ROOT", "Founder_ROOT", "Monitor_ROOT"];

export default function Page() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeIdRef = useRef(activeId);
  const hoveredIdRef = useRef(hoveredId);

  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => { hoveredIdRef.current = hoveredId; }, [hoveredId]);

  const handleSelect = (id: string | null) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveId(null);
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        setActiveId((prev) => {
          const idx = BUILDINGS.indexOf(prev ?? "");
          if (idx === -1) return BUILDINGS[0];
          return e.key === "ArrowRight"
            ? BUILDINGS[(idx + 1) % BUILDINGS.length]
            : BUILDINGS[(idx - 1 + BUILDINGS.length) % BUILDINGS.length];
        });
      } else if (e.key === "Enter" && !activeIdRef.current) {
        setActiveId(hoveredIdRef.current ?? BUILDINGS[0]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className={styles.pageLayout}>
      <NavSidebar activeId={activeId} onSelect={handleSelect} />

      <div className={styles.mobileNav}>
        <span className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
          NubeLab
        </span>
        <ul style={{ display: "flex", gap: 16, listStyle: "none", margin: 0, padding: 0 }}>
          {BUILDINGS.map((id) => (
            <li key={id}>
              <button
                onClick={() => handleSelect(id)}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: 12,
                  color: activeId === id ? "var(--accent)" : "var(--muted)",
                  cursor: "pointer",
                  padding: "4px 0",
                }}
              >
                {id.replace("_ROOT", "")}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <main className={styles.hero}>
        <div className={styles.sceneContainer}>
          <Suspense fallback={null}>
            <MoonScene
              activeId={activeId}
              hoveredId={hoveredId}
              cameraTarget={activeId}
              onSelect={handleSelect}
              onHover={setHoveredId}
            />
          </Suspense>
        </div>
        <div className={styles.heroText}>
          <h1>Operational Systems Platform</h1>
          <p>A cloud lab for systems, infrastructure and operations</p>
        </div>
      </main>

      <SectionPanel activeId={activeId} onClose={() => setActiveId(null)} />
      <StatusBar />
    </div>
  );
}
