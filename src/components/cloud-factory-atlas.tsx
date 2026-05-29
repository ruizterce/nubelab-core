"use client";

import { useMemo, useState } from "react";
import { siteConfig } from "@/config/site";
import styles from "./cloud-factory-atlas.module.css";

type AtlasNode = {
  id: "core" | "author" | "infra" | "lab" | "ops";
  title: string;
  short: string;
  state: string;
  role: string;
  description: string;
  detail: string;
  x: number;
  y: number;
  variant: "core" | "author" | "infra" | "lab" | "ops";
  href?: string;
  tags: string[];
  disabled?: boolean;
};

type Connection = {
  from: AtlasNode["id"];
  to: AtlasNode["id"];
  kind: "signal" | "process" | "external" | "guard";
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
    x: 50,
    y: 48,
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
    x: 28,
    y: 33,
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
    x: 50,
    y: 21,
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
    x: 72,
    y: 37,
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
    x: 35,
    y: 68,
    variant: "ops",
    disabled: true,
    tags: ["deploy", "health", "security"],
  },
];

const connections: Connection[] = [
  { from: "core", to: "author", kind: "signal" },
  { from: "core", to: "infra", kind: "external" },
  { from: "core", to: "lab", kind: "process" },
  { from: "core", to: "ops", kind: "guard" },
];

function nodePoint(node: AtlasNode) {
  return {
    x: node.x * 10,
    y: node.y * 6.8,
  };
}

function connectionPath(from: AtlasNode, to: AtlasNode) {
  const a = nodePoint(from);
  const b = nodePoint(to);

  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

function NodeIcon({ variant }: { variant: AtlasNode["variant"] }) {
  return (
    <span className={`${styles.nodeIcon} ${styles[`${variant}Icon`]}`}>
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export function CloudFactoryAtlas() {
  const [activeNodeId, setActiveNodeId] = useState<AtlasNode["id"]>("core");
  const [hoveredNodeId, setHoveredNodeId] = useState<AtlasNode["id"] | null>(null);

  const nodeMap = useMemo(() => new Map(atlasNodes.map((node) => [node.id, node])), []);
  const activeNode = nodeMap.get(activeNodeId) ?? atlasNodes[0];
  const hoveredNode = hoveredNodeId ? nodeMap.get(hoveredNodeId) : null;
  const previewNode = hoveredNode ?? activeNode;

  function focusNode(nodeId: AtlasNode["id"]) {
    const node = nodeMap.get(nodeId);

    if (!node) {
      return;
    }

    setActiveNodeId(nodeId);
  }

  function selectCore() {
    setActiveNodeId("core");
  }

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <a
          className={styles.brand}
          href="#core"
          onClick={(event) => {
            event.preventDefault();
            selectCore();
          }}
        >
          <span className={styles.brandMark}>NL</span>
          <span>
            <span className={styles.brandName}>{siteConfig.name}</span>
            <span className={styles.brandMeta}>Cloud Factory Atlas</span>
          </span>
        </a>

        <div className={styles.headerTools}>
          <label className={styles.jumpLabel} htmlFor="atlas-jump">
            Jump
          </label>
          <select
            className={styles.jumpSelect}
            id="atlas-jump"
            onChange={(event) => focusNode(event.target.value as AtlasNode["id"])}
            value={activeNode.id}
          >
            {atlasNodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.title}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.narrative}>
          <p className={styles.kicker}>Operational systems platform</p>
          <h1>Nubelab</h1>
          <p>
            A cloud lab for systems, infrastructure and operations
          </p>
        </div>

        <div
          aria-label="Interactive NubeLab cloud factory map"
          className={styles.mapStage}
        >
          <div className={styles.mapWorld}>
            <svg className={styles.cloudShape} viewBox="0 0 1000 680" aria-hidden="true">
              <defs>
                <linearGradient id="islandFill" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f7fbff" />
                  <stop offset="55%" stopColor="#dfeef2" />
                  <stop offset="100%" stopColor="#cadfd9" />
                </linearGradient>
              </defs>
              <path
                d="M117 363 C69 324 93 257 159 244 C173 168 249 137 313 174 C365 95 483 91 538 164 C611 117 721 146 742 231 C823 226 888 281 874 354 C948 389 931 487 842 505 C803 574 700 579 648 533 C579 589 461 591 405 531 C330 568 222 535 204 468 C156 468 125 433 117 363 Z"
                fill="url(#islandFill)"
                stroke="#9fb6b8"
                strokeWidth="2"
              />
              <path
                d="M144 364 C249 427 346 449 501 439 C633 430 749 445 872 375"
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.32"
                strokeWidth="18"
              />
            </svg>

            <svg className={styles.flowLayer} viewBox="0 0 1000 680" aria-hidden="true">
              {connections.map((connection) => {
                const from = nodeMap.get(connection.from);
                const to = nodeMap.get(connection.to);

                if (!from || !to) {
                  return null;
                }

                return (
                  <path
                    className={`${styles.flowPath} ${styles[connection.kind]}`}
                    d={connectionPath(from, to)}
                    key={`${connection.from}-${connection.to}`}
                  />
                );
              })}
            </svg>

            <div className={styles.cloudShadow} aria-hidden="true" />

            {atlasNodes.map((node) => (
              <button
                aria-label={node.title}
                aria-pressed={activeNode.id === node.id}
                className={[
                  styles.node,
                  styles[node.variant],
                  activeNode.id === node.id ? styles.nodeActive : "",
                  hoveredNodeId === node.id ? styles.nodeHovered : "",
                  node.disabled ? styles.nodeDisabled : "",
                ].join(" ")}
                data-map-control
                key={node.id}
                onBlur={() => setHoveredNodeId(null)}
                onClick={() => setActiveNodeId(node.id)}
                onFocus={() => setHoveredNodeId(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                }}
                type="button"
              >
                <span className={styles.nodeTile} />
                <NodeIcon variant={node.variant} />
                <span className={styles.nodeLabel}>{node.short}</span>
              </button>
            ))}

            <div
              className={styles.hoverReadout}
              style={{
                left: `${previewNode.x}%`,
                top: `${previewNode.y}%`,
              }}
            >
              <span>{previewNode.title}</span>
              <small>{previewNode.state}</small>
            </div>
          </div>

          <div className={styles.mapHint} data-map-control>
            Select a node. Follow the radial system.
          </div>
        </div>

        <aside className={styles.inspector} data-map-control>
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
            <a className={styles.inspectorLink} href={activeNode.href} rel="noreferrer" target="_blank">
              Open external system
            </a>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
