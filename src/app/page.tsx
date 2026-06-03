"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import styles from "./page.module.css";

const MoonScene = dynamic(
  () => import("@/components/moon-scene").then((m) => ({ default: m.MoonScene })),
  { ssr: false }
);

export default function Page() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const label = hoveredId
    ? hoveredId.replace("_ROOT", "")
    : activeId
      ? activeId.replace("_ROOT", "")
      : null;

  return (
    <>
      <nav className={styles.nav}>
        <span className={styles.logo}>NubeLab</span>
        <ul className={styles.links}>
          <li><a href="#">Systems</a></li>
          <li><a href="#">Infra</a></li>
          <li><a href="#">Lab</a></li>
          <li><a href="#">About</a></li>
        </ul>
      </nav>
      <section className={styles.hero}>
        <div className={styles.sceneContainer}>
          <Suspense fallback={null}>
            <MoonScene
              activeId={activeId}
              hoveredId={hoveredId}
              onSelect={setActiveId}
              onHover={setHoveredId}
            />
          </Suspense>
        </div>
        <div className={styles.heroText}>
          <h1>Operational Systems Platform</h1>
          <p>A cloud lab for systems, infrastructure and operations</p>
        </div>
        {label && <div className={styles.tooltip}>{label}</div>}
      </section>
    </>
  );
}
