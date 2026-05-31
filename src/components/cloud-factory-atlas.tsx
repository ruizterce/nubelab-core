"use client";

import { useMemo, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { siteConfig } from "@/config/site";
import styles from "./cloud-factory-atlas.module.css";

const CloudCanvas = dynamic(
  () => import("./cloud-canvas").then((mod) => ({ default: mod.CloudCanvas })),
  { ssr: false }
);

const AtlasScene = dynamic(
  () => import("./atlas").then((mod) => ({ default: mod.AtlasScene })),
  { ssr: false }
);

/* ── data ─────────────────────────────────────────── */

type AtlasNode = {
  id: "core" | "author" | "infra" | "lab" | "ops";
  title: string;
  short: string;
  state: string;
  role: string;
  description: string;
  detail: string;
  variant: "core" | "author" | "infra" | "lab" | "ops";
  href?: string;
  tags: string[];
  disabled?: boolean;
};

const atlasNodes: AtlasNode[] = [
  {
    id: "core",
    title: "NubeLab Core",
    short: "Core",
    state: "active",
    role: "hub",
    description: "The central map and public operating layer for NubeLab.",
    detail:
      "Core is the main navigation point: it connects the author, the live infrastructure boundary, the lab space, and the operational discipline around the platform.",
    variant: "core",
    tags: ["hub", "identity", "systems"],
  },
  {
    id: "author",
    title: "Author",
    short: "Author",
    state: "online",
    role: "operator",
    description: "The engineering profile behind the system.",
    detail:
      "This node frames the person behind NubeLab through systems thinking, industrial engineering, DevOps, automation, AI workflows, and operational ownership.",
    variant: "author",
    disabled: true,
    tags: ["profile", "engineering", "operator"],
  },
  {
    id: "infra",
    title: "Infra",
    short: "Infra",
    state: "external",
    role: "relay",
    description: "A portal to the independent live infrastructure environment.",
    detail:
      "Infra links out to infra.nubelab.es. The main site can point to runtime reality without exposing Prometheus, exporters, or internal services here.",
    variant: "infra",
    href: "https://infra.nubelab.es",
    tags: ["vps", "observability", "boundary"],
  },
  {
    id: "lab",
    title: "Lab",
    short: "Lab",
    state: "open",
    role: "workshop",
    description: "Experiments, prototypes, and AI-assisted operational tooling.",
    detail:
      "Lab is the experimental district: a place for automation routines, AI operations, internal tools, and small systems that may later become formal platform modules.",
    variant: "lab",
    disabled: true,
    tags: ["ai", "automation", "experiments"],
  },
  {
    id: "ops",
    title: "Ops",
    short: "Ops",
    state: "sealed",
    role: "control",
    description: "Deployment discipline, health, safety boundaries, and operations.",
    detail:
      "Ops keeps the map grounded: deployment shape, health checks, security defaults, operational rules, and the line between public interface and private systems.",
    variant: "ops",
    disabled: true,
    tags: ["deploy", "health", "security"],
  },
];

/* ── component ────────────────────────────────────── */

export function CloudFactoryAtlas() {
  const [activeNodeId, setActiveNodeId] = useState<AtlasNode["id"]>("core");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const nodeMap = useMemo(() => new Map(atlasNodes.map((n) => [n.id, n])), []);
  const activeNode = nodeMap.get(activeNodeId) ?? atlasNodes[0];
  const previewTitle = (hoveredNodeId ? nodeMap.get(hoveredNodeId as AtlasNode["id"]) : null) ?? activeNode;

  const disabledNodes = useMemo(
    () => atlasNodes.filter((n) => n.disabled).map((n) => n.id),
    []
  );

  return (
    <main className={styles.shell}>
      <div className={styles.narrative}>
        <p className={styles.kicker}>Operational systems platform</p>
        <h1>Nubelab</h1>
        <p>A cloud lab for systems, infrastructure and operations</p>
      </div>

      <div className={styles.mapStage}>
        <Suspense fallback={null}>
          <CloudCanvas />
        </Suspense>
        <Suspense fallback={null}>
          <AtlasScene
            activeNodeId={activeNodeId}
            hoveredNodeId={hoveredNodeId}
            onSelectNode={(id) => setActiveNodeId(id as AtlasNode["id"])}
            onHoverNode={setHoveredNodeId}
            disabledNodes={disabledNodes}
          />
        </Suspense>

        <div className={styles.mapHint} data-map-control>
          {hoveredNodeId
            ? `${previewTitle.title} — ${previewTitle.state}`
            : "Select a node."}
        </div>

        <div className={styles.sysRef} aria-hidden="true">
          SYS.ATLAS — {siteConfig.domain}
        </div>
      </div>

      <aside className={styles.inspector} data-map-control>
        <nav className={styles.nodeTabs}>
          {atlasNodes.map((n) => (
            <button
              key={n.id}
              className={n.id === activeNode.id ? styles.nodeTabActive : styles.nodeTab}
              onClick={() => setActiveNodeId(n.id)}
              type="button"
            >
              {n.short}
            </button>
          ))}
        </nav>

        <div className={styles.inspectorHeader}>
          <span>{activeNode.role}</span>
          <strong>{activeNode.state}</strong>
        </div>
        <h2>{activeNode.title}</h2>
        <p>{activeNode.description}</p>
        <p className={styles.inspectorDetail}>{activeNode.detail}</p>
        <div className={styles.tagCloud}>
          {activeNode.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        {activeNode.href ? (
          <a
            className={styles.inspectorLink}
            href={activeNode.href}
            rel="noreferrer"
            target="_blank"
          >
            Open external system
          </a>
        ) : null}
      </aside>
    </main>
  );
}
