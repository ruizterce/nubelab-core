"use client";

const TEXT =
  "CLOUD PLATFORM OPERATIONAL  |  UPLINK: ACTIVE  |  MODULES: 20 ONLINE  |  SECTOR: NOMINAL  |  NUBELAB CORE v1.0  |  SYSTEM: ALL GREEN";

export function StatusBar() {
  return (
    <div className="status-bar">
      <div className="status-bar-track">
        <span className="status-bar-text">{TEXT}</span>
        <span className="status-bar-text" aria-hidden>
          {TEXT}
        </span>
      </div>
    </div>
  );
}
