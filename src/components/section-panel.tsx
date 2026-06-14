"use client";

import { useEffect, useState } from "react";
import styles from "./section-panel.module.css";
import { MonitorPanel } from "./monitor-panel";
import { CorePanel } from "./core-panel";

const SECTIONS: Record<string, { title: string; subtitle: string; lines: string[] }> = {
  Core_ROOT: {
    title: "CORE",
    subtitle: "Platform Infrastructure",
    lines: [],
  },
  Author_ROOT: {
    title: "AUTHOR",
    subtitle: "Portfolio & Content",
    lines: [
      "> loading author profile...",
      "",
      "NubeLab runs on a single VPS at Hetzner,",
      "serving infrastructure, automation,",
      "and content from one lunar base.",
      "",
      "> n8n.nubelab.es — workflow automation",
      "> music.nubelab.es — music streaming",
      "",
      "[ Content pending ]",
    ],
  },
  Monitor_ROOT: {
    title: "MONITOR",
    subtitle: "Live Server Data",
    lines: [],
  },
};

function Typewriter({ lines }: { lines: string[] }) {
  const [typed, setTyped] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let idx = 0;
    const timer = setInterval(() => {
      if (idx < lines.length) {
        setTyped((prev) => [...prev, lines[idx]]);
        idx++;
      } else {
        setDone(true);
        clearInterval(timer);
      }
    }, 60);
    return () => clearInterval(timer);
  }, [lines]);

  return (
    <div className={styles.body}>
      {typed.map((line, i) => (
        <div key={i} className={styles.line}>
          {line}
        </div>
      ))}
      {!done && <span className={styles.cursor}>█</span>}
    </div>
  );
}

interface SectionPanelProps {
  activeId: string | null;
  onClose: () => void;
}

export function SectionPanel({ activeId, onClose }: SectionPanelProps) {
  const isOpen = activeId !== null;
  const section = activeId ? SECTIONS[activeId] : null;

  return (
    <div className={`${styles.panel} ${isOpen ? styles.open : ""}`} data-open={isOpen}>
      <div className={styles.scanlines} />
      <div className={styles.content}>
        {section && (
          <>
            <div className={styles.header}>
              <div className={styles.hudCorners}>
                <div className={styles.headerContent}>
                  <span className={styles.tag}>MODULE</span>
                  <h2 className={styles.title}>{section.title}</h2>
                  <p className={styles.subtitle}>{section.subtitle}</p>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>
                ✕
              </button>
            </div>
            {activeId === "Monitor_ROOT" ? (
              <div className={styles.body}>
                <MonitorPanel visible={isOpen && activeId === "Monitor_ROOT"} />
              </div>
            ) : activeId === "Core_ROOT" ? (
              <div className={styles.body}>
                <CorePanel />
              </div>
            ) : (
              <Typewriter key={activeId} lines={section.lines} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
