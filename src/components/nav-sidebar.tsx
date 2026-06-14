"use client";

import styles from "./nav-sidebar.module.css";

const BUILDINGS = [
  { id: "Core_ROOT", label: "Core" },
  { id: "Founder_ROOT", label: "Founder" },
  { id: "Monitor_ROOT", label: "Monitor" },
] as const;

interface NavSidebarProps {
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

export function NavSidebar({ activeId, onSelect }: NavSidebarProps) {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>NubeLab</div>
      <ul className={styles.links}>
        {BUILDINGS.map(({ id, label }) => (
          <li key={id}>
            <button
              className={`${styles.link} ${activeId === id ? styles.active : ""}`}
              onClick={() => onSelect(id)}
            >
              <span className={styles.dot} />
              {label}
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.footer}>
        <span className={styles.version}>v1.0</span>
      </div>
    </nav>
  );
}
