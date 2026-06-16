"use client";

import styles from "./section-panel.module.css";
import { MonitorPanel } from "./monitor-panel";
import { CorePanel } from "./core-panel";
import { FounderPanel } from "./founder-panel";

const SECTIONS: Record<string, { title: string; subtitle: string }> = {
  Core_ROOT: { title: "CORE", subtitle: "Platform Infrastructure" },
  Founder_ROOT: { title: "FOUNDER", subtitle: "Portfolio & Content" },
  Monitor_ROOT: { title: "MONITOR", subtitle: "Live Server Data" },
};

const SECTION_PANELS: Record<string, React.FC<{ visible?: boolean }>> = {
  Core_ROOT: CorePanel,
  Founder_ROOT: FounderPanel,
  Monitor_ROOT: ({ visible }) => <MonitorPanel visible={!!visible} />,
};

interface SectionPanelProps {
  activeId: string | null;
  onClose: () => void;
}

export function SectionPanel({ activeId, onClose }: SectionPanelProps) {
  const isOpen = activeId !== null;
  const section = activeId ? SECTIONS[activeId] : null;
  const Panel = activeId ? SECTION_PANELS[activeId] : null;

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
            {Panel && (
              <div className={styles.body}>
                <Panel visible={isOpen} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
